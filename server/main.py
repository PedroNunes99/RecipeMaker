from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from services.nutrition_service import NutritionService
from services.ai_service import AIService
from services.ingredient_service import IngredientService
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

@app.get("/recipes")
async def get_recipes():
    recipes = await db.recipe.find_many(include={"steps": True, "ingredients": {"include": {"ingredient": True}}})
    return recipes

@app.post("/recipes/manual")
async def create_recipe_manual(data: dict):
    # Check for duplicates
    existing = await db.recipe.find_first(where={"title": data['title']})
    if existing:
        raise HTTPException(status_code=409, detail="Recipe with this title already exists")

    # data includes title, description, servings, steps (list), ingredients (list of {id, qty, unit})
    recipe_data = {
        "title": data['title'],
        "description": data.get('description'),
        "servings": data.get('servings', 1),
    }
    
    # Calculate nutrition (this would be more robust in reality)
    # For now, just create the recipe
    recipe = await db.recipe.create(data=recipe_data)
    
    # Create steps
    for step in data.get('steps', []):
        await db.recipestep.create(data={
            "order": step['order'],
            "instruction": step['instruction'],
            "recipeId": recipe.id
        })
        
    # Link ingredients
    for item in data.get('ingredients', []):
        await db.recipeingredient.create(data={
            "quantity": item['quantity'],
            "unit": item['unit'],
            "recipeId": recipe.id,
            "ingredientId": item['ingredientId']
        })
        
    return await db.recipe.find_unique(where={"id": recipe.id}, include={"steps": True, "ingredients": True})

@app.post("/recipes/ai-generate")
async def generate_recipe(data: dict):
    ai = AIService()
    prompt = data.get('prompt')
    recipe = await ai.generate_recipe_from_prompt(prompt)
    return recipe

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
