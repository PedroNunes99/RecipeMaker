from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from services.nutrition_service import NutritionService
from services.ai_service import AIService
from services.ingredient_service import IngredientService
from services.usda_service import USDAService
from services.image_service import ImageService
from models.recipe_models import RecipeCreateRequest, RecipeUpdateRequest
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="RecipeMaker API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Prisma()

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

@app.get("/")
async def root():
    return {"message": "RecipeMaker API is running"}

@app.get("/ingredients")
async def get_ingredients():
    ingredients = await db.ingredient.find_many()
    return ingredients

@app.get("/ingredients/search")
async def search_ingredients(q: str):
    service = IngredientService()
    results = await service.search_public_ingredients(q)
    return results

@app.get("/ingredients/{ingredient_id}/purchase")
async def get_ingredient_purchase(ingredient_id: str, name: str):
    service = IngredientService()
    info = await service.get_purchase_info(name)
    return info

@app.post("/ingredients")
async def create_ingredient(data: dict):
    ingredient = await db.ingredient.create(data=data)
    return ingredient

@app.get("/ingredients/usda/search")
async def search_usda_ingredients(q: str, limit: int = 25):
    """
    Search USDA FoodData Central database for ingredients.
    Returns up to 380,000+ foods with official USDA nutrition data.
    """
    try:
        service = USDAService()
        results = service.search_foods(q, page_size=limit)
        return {
            "source": "USDA FoodData Central",
            "query": q,
            "count": len(results),
            "results": results
        }
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"USDA API error: {str(e)}")

@app.get("/ingredients/usda/{fdc_id}")
async def get_usda_ingredient_details(fdc_id: int):
    """
    Get detailed nutrition information for a specific USDA food.
    """
    try:
        service = USDAService()
        food = service.get_food_details(fdc_id)

        if not food:
            raise HTTPException(status_code=404, detail="Food not found in USDA database")

        return food
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"USDA API error: {str(e)}")

@app.post("/ingredients/usda/import/{fdc_id}")
async def import_usda_ingredient(fdc_id: int):
    """
    Import an ingredient from USDA database into local database.
    """
    try:
        service = USDAService()

        # Get detailed food data
        usda_food = service.get_food_details(fdc_id)
        if not usda_food:
            raise HTTPException(status_code=404, detail="Food not found in USDA database")

        # Convert to our ingredient format
        ingredient_data = service.convert_to_ingredient_format(usda_food)

        # Check if already exists
        existing = await db.ingredient.find_first(where={"name": ingredient_data["name"]})
        if existing:
            raise HTTPException(status_code=409, detail=f"Ingredient '{ingredient_data['name']}' already exists")

        # Create in database
        ingredient = await db.ingredient.create(data=ingredient_data)

        return {
            "message": "Ingredient imported successfully",
            "ingredient": ingredient,
            "source": "USDA FoodData Central",
            "fdcId": fdc_id
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing ingredient: {str(e)}")

@app.get("/recipes")
async def get_recipes():
    recipes = await db.recipe.find_many(include={"steps": True, "ingredients": {"include": {"ingredient": True}}})
    return recipes

@app.post("/recipes/manual")
async def create_recipe_manual(data: RecipeCreateRequest):
    """
    Create a new recipe with automatic nutrition calculation.
    Nutrition is calculated from the ingredient list and saved to the recipe.
    """
    # Check for duplicates
    existing = await db.recipe.find_first(where={"title": data.title})
    if existing:
        raise HTTPException(status_code=409, detail="Recipe with this title already exists")

    # Fetch ingredient data and calculate nutrition
    ingredients_with_data = []
    for item in data.ingredients:
        ing = await db.ingredient.find_unique(where={"id": item.ingredientId})
        if not ing:
            raise HTTPException(status_code=404, detail=f"Ingredient with ID {item.ingredientId} not found")

        ingredients_with_data.append({
            "ingredient": ing,
            "quantity": item.quantity,
            "unit": item.unit
        })

    # Calculate nutrition using existing NutritionService
    totals = NutritionService.calculate_recipe_totals(ingredients_with_data)

    # Generate image URLs
    image_urls = ImageService.generate_all_image_urls(
        title=data.title,
        description=data.description or "",
        steps=[{"order": s.order, "instruction": s.instruction} for s in data.steps]
    )

    # Create recipe WITH calculated nutrition and hero image
    recipe_data = {
        "title": data.title,
        "description": data.description,
        "servings": data.servings,
        "totalCalories": totals["calories"],
        "totalProtein": totals["protein"],
        "totalCarbs": totals["carbs"],
        "totalFat": totals["fat"],
        "imageUrl": image_urls["recipe_image_url"],
    }

    recipe = await db.recipe.create(data=recipe_data)

    # Create steps with notes and generated images
    for i, step in enumerate(data.steps):
        await db.recipestep.create(data={
            "order": step.order,
            "instruction": step.instruction,
            "notes": step.notes,
            "photoUrl": image_urls["step_image_urls"][i],
            "recipeId": recipe.id
        })

    # Link ingredients
    for item in data.ingredients:
        await db.recipeingredient.create(data={
            "quantity": item.quantity,
            "unit": item.unit,
            "recipeId": recipe.id,
            "ingredientId": item.ingredientId
        })

    return await db.recipe.find_unique(
        where={"id": recipe.id},
        include={"steps": True, "ingredients": {"include": {"ingredient": True}}}
    )

@app.get("/recipes/search")
async def search_recipes(q: str):
    """Search recipes by title or description."""
    recipes = await db.recipe.find_many(
        where={
            "OR": [
                {"title": {"contains": q}},
                {"description": {"contains": q}}
            ]
        },
        include={"steps": True, "ingredients": {"include": {"ingredient": True}}}
    )
    return recipes

@app.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: str):
    """Get a single recipe by ID with all relationships."""
    recipe = await db.recipe.find_unique(
        where={"id": recipe_id},
        include={"steps": True, "ingredients": {"include": {"ingredient": True}}}
    )

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    return recipe

@app.put("/recipes/{recipe_id}")
async def update_recipe(recipe_id: str, data: RecipeUpdateRequest):
    """
    Update an existing recipe and recalculate nutrition if ingredients change.
    """
    # Verify recipe exists
    existing = await db.recipe.find_unique(where={"id": recipe_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Start with basic fields
    update_data = {}
    if data.title is not None:
        # Check for duplicate title (excluding current recipe)
        duplicate = await db.recipe.find_first(
            where={"title": data.title, "id": {"not": recipe_id}}
        )
        if duplicate:
            raise HTTPException(status_code=409, detail="Recipe with this title already exists")
        update_data["title"] = data.title

    if data.description is not None:
        update_data["description"] = data.description

    if data.servings is not None:
        update_data["servings"] = data.servings

    # Regenerate hero image if title or description changed
    if data.title is not None or data.description is not None:
        new_title = data.title or existing.title
        new_desc = data.description or existing.description or ""
        update_data["imageUrl"] = ImageService.generate_recipe_image_url(new_title, new_desc)

    # Handle steps update
    if data.steps is not None:
        # Delete existing steps
        await db.recipestep.delete_many(where={"recipeId": recipe_id})
        # Generate step images
        current_title = data.title or existing.title
        step_image_urls = [
            ImageService.generate_step_image_url(s.instruction, current_title, s.order)
            for s in data.steps
        ]
        # Create new steps with notes and images
        for i, step in enumerate(data.steps):
            await db.recipestep.create(data={
                "order": step.order,
                "instruction": step.instruction,
                "notes": step.notes,
                "photoUrl": step_image_urls[i],
                "recipeId": recipe_id
            })

    # Handle ingredients update and recalculate nutrition
    if data.ingredients is not None:
        # Delete existing ingredient relationships
        await db.recipeingredient.delete_many(where={"recipeId": recipe_id})

        # Fetch ingredient data and calculate nutrition
        ingredients_with_data = []
        for item in data.ingredients:
            ing = await db.ingredient.find_unique(where={"id": item.ingredientId})
            if not ing:
                raise HTTPException(status_code=404, detail=f"Ingredient with ID {item.ingredientId} not found")
            ingredients_with_data.append({
                "ingredient": ing,
                "quantity": item.quantity,
                "unit": item.unit
            })

        # Calculate nutrition
        totals = NutritionService.calculate_recipe_totals(ingredients_with_data)
        update_data["totalCalories"] = totals["calories"]
        update_data["totalProtein"] = totals["protein"]
        update_data["totalCarbs"] = totals["carbs"]
        update_data["totalFat"] = totals["fat"]

        # Create new ingredient relationships
        for item in data.ingredients:
            await db.recipeingredient.create(data={
                "quantity": item.quantity,
                "unit": item.unit,
                "recipeId": recipe_id,
                "ingredientId": item.ingredientId
            })

    # Update recipe
    recipe = await db.recipe.update(
        where={"id": recipe_id},
        data=update_data
    )

    # Return complete recipe
    return await db.recipe.find_unique(
        where={"id": recipe_id},
        include={"steps": True, "ingredients": {"include": {"ingredient": True}}}
    )

@app.delete("/recipes/{recipe_id}")
async def delete_recipe(recipe_id: str):
    """
    Delete a recipe. Steps and ingredients are cascade deleted.
    """
    # Verify recipe exists
    recipe = await db.recipe.find_unique(where={"id": recipe_id})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Delete recipe (cascade will handle steps and ingredients)
    await db.recipe.delete(where={"id": recipe_id})

    return {"message": "Recipe deleted successfully", "id": recipe_id}

@app.post("/recipes/ai-generate")
async def generate_recipe(data: dict):
    """
    Generate recipe with AI and return in ManualForm-compatible format
    """
    try:
        ai = AIService()
        prompt = data.get('prompt', '')

        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")

        # Generate recipe with matched ingredients
        recipe = await ai.generate_recipe_from_prompt(prompt)

        return recipe

    except HTTPException:
        raise
    except Exception as e:
        print(f"AI generation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@app.get("/lists")
async def get_lists():
    lists = await db.recipelist.find_many(include={"recipes": True})
    return lists

@app.post("/lists")
async def create_list(data: dict):
    # data: { name, userId }
    res = await db.recipelist.create(data=data)
    return res

@app.post("/lists/{list_id}/recipes/{recipe_id}")
async def add_recipe_to_list(list_id: str, recipe_id: str):
    res = await db.recipelist.update(
        where={"id": list_id},
        data={"recipes": {"connect": [{"id": recipe_id}]}}
    )
    return res

@app.post("/recipes/calculate-nutrition")
async def calculate_nutrition(data: dict):
    # data: { ingredients: [{ ingredientId, quantity, unit }] }
    ingredients_with_data = []
    for item in data['ingredients']:
        ing = await db.ingredient.find_unique(where={"id": item['ingredientId']})
        if ing:
            ingredients_with_data.append({
                "ingredient": ing,
                "quantity": item['quantity'],
                "unit": item['unit']
            })
    
    totals = NutritionService.calculate_recipe_totals(ingredients_with_data)
    return totals

# More routes will be added here
