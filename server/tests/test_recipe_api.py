"""
Tests for recipe CRUD API endpoints.
Tests creation with auto-nutrition calculation, retrieval, update, delete, and search.
"""

import pytest


@pytest.mark.asyncio
async def test_create_recipe_calculates_nutrition(api_client, multiple_ingredients):
    """
    Test that POST /recipes/manual automatically calculates and saves nutrition.
    """
    chicken = multiple_ingredients[0]  # 165 cal, 31g protein per 100g
    broccoli = multiple_ingredients[1]  # 34 cal, 2.8g protein per 100g

    recipe_data = {
        "title": "Healthy Chicken Bowl",
        "description": "Protein-packed meal",
        "servings": 2,
        "ingredients": [
            {"ingredientId": chicken.id, "quantity": 200, "unit": "g"},  # 330 cal, 62g protein
            {"ingredientId": broccoli.id, "quantity": 100, "unit": "g"}  # 34 cal, 2.8g protein
        ],
        "steps": [
            {"order": 1, "instruction": "Cook chicken"},
            {"order": 2, "instruction": "Steam broccoli"}
        ]
    }

    response = await api_client.post("/recipes/manual", json=recipe_data)

    assert response.status_code == 200
    data = response.json()

    # Verify nutrition was calculated and saved
    # 200g chicken: 330 cal, 62g protein, 0g carbs, 7.2g fat
    # 100g broccoli: 34 cal, 2.8g protein, 7g carbs, 0.4g fat
    # Total: 364 cal, 64.8g protein, 7g carbs, 7.6g fat
    assert data["totalCalories"] == pytest.approx(364, rel=0.01)
    assert data["totalProtein"] == pytest.approx(64.8, rel=0.01)
    assert data["totalCarbs"] == pytest.approx(7.0, rel=0.01)
    assert data["totalFat"] == pytest.approx(7.6, rel=0.01)

    # Verify steps and ingredients were created
    assert len(data["steps"]) == 2
    assert len(data["ingredients"]) == 2


@pytest.mark.asyncio
async def test_get_recipe_by_id(api_client, clean_db, multiple_ingredients):
    """
    Test GET /recipes/{id} returns recipe with all relationships.
    """
    chicken = multiple_ingredients[0]

    # Create a recipe first
    recipe = await clean_db.recipe.create(data={
        "title": "Test Recipe",
        "servings": 1,
        "totalCalories": 165,
        "totalProtein": 31,
        "totalCarbs": 0,
        "totalFat": 3.6
    })

    # Add a step
    await clean_db.recipestep.create(data={
        "order": 1,
        "instruction": "Cook chicken",
        "recipeId": recipe.id
    })

    # Add an ingredient
    await clean_db.recipeingredient.create(data={
        "quantity": 100,
        "unit": "g",
        "recipeId": recipe.id,
        "ingredientId": chicken.id
    })

    # Test GET endpoint
    response = await api_client.get(f"/recipes/{recipe.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == recipe.id
    assert data["title"] == "Test Recipe"
    assert data["totalCalories"] == 165
    assert len(data["steps"]) == 1
    assert len(data["ingredients"]) == 1


@pytest.mark.asyncio
async def test_get_recipe_not_found(api_client):
    """
    Test GET /recipes/{id} returns 404 for non-existent recipe.
    """
    response = await api_client.get("/recipes/non-existent-id")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


@pytest.mark.asyncio
async def test_update_recipe_title(api_client, clean_db):
    """
    Test PUT /recipes/{id} updates recipe title.
    """
    # Create recipe
    recipe = await clean_db.recipe.create(data={
        "title": "Old Title",
        "servings": 1,
        "totalCalories": 100,
        "totalProtein": 20,
        "totalCarbs": 10,
        "totalFat": 5
    })

    # Update title
    update_data = {"title": "New Title"}
    response = await api_client.put(f"/recipes/{recipe.id}", json=update_data)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    # Other fields should remain unchanged
    assert data["totalCalories"] == 100


@pytest.mark.asyncio
async def test_update_recipe_ingredients_recalculates_nutrition(api_client, clean_db, multiple_ingredients):
    """
    Test that updating ingredients recalculates nutrition.
    """
    chicken = multiple_ingredients[0]  # 165 cal, 31g protein per 100g
    broccoli = multiple_ingredients[1]  # 34 cal, 2.8g protein per 100g

    # Create recipe with initial nutrition
    recipe = await clean_db.recipe.create(data={
        "title": "Test Recipe",
        "servings": 1,
        "totalCalories": 0,
        "totalProtein": 0,
        "totalCarbs": 0,
        "totalFat": 0
    })

    # Update with ingredients
    update_data = {
        "ingredients": [
            {"ingredientId": chicken.id, "quantity": 100, "unit": "g"},  # 165 cal, 31g protein
            {"ingredientId": broccoli.id, "quantity": 50, "unit": "g"}   # 17 cal, 1.4g protein
        ]
    }
    response = await api_client.put(f"/recipes/{recipe.id}", json=update_data)

    assert response.status_code == 200
    data = response.json()

    # Should calculate nutrition for 100g chicken + 50g broccoli
    # 100g chicken: 165 cal, 31g protein, 0g carbs, 3.6g fat
    # 50g broccoli: 17 cal, 1.4g protein, 3.5g carbs, 0.2g fat
    # Total: 182 cal, 32.4g protein, 3.5g carbs, 3.8g fat
    assert data["totalCalories"] == pytest.approx(182, rel=0.01)
    assert data["totalProtein"] == pytest.approx(32.4, rel=0.01)
    assert data["totalCarbs"] == pytest.approx(3.5, rel=0.01)
    assert data["totalFat"] == pytest.approx(3.8, rel=0.01)


@pytest.mark.asyncio
async def test_delete_recipe(api_client, clean_db):
    """
    Test DELETE /recipes/{id} removes recipe.
    """
    # Create recipe
    recipe = await clean_db.recipe.create(data={
        "title": "To Delete",
        "servings": 1,
        "totalCalories": 100,
        "totalProtein": 20,
        "totalCarbs": 10,
        "totalFat": 5
    })

    # Delete
    response = await api_client.delete(f"/recipes/{recipe.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Recipe deleted successfully"
    assert data["id"] == recipe.id

    # Verify deletion
    deleted = await clean_db.recipe.find_unique(where={"id": recipe.id})
    assert deleted is None


@pytest.mark.asyncio
async def test_search_recipes_by_title(api_client, clean_db):
    """
    Test GET /recipes/search finds recipes by title.
    """
    # Create test recipes
    await clean_db.recipe.create(data={
        "title": "Chicken Parmesan",
        "servings": 1,
        "totalCalories": 100,
        "totalProtein": 20,
        "totalCarbs": 10,
        "totalFat": 5
    })
    await clean_db.recipe.create(data={
        "title": "Beef Stew",
        "servings": 1,
        "totalCalories": 200,
        "totalProtein": 30,
        "totalCarbs": 15,
        "totalFat": 8
    })

    # Search for chicken
    response = await api_client.get("/recipes/search?q=chicken")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "chicken" in data[0]["title"].lower()


@pytest.mark.asyncio
async def test_create_recipe_duplicate_title(api_client, clean_db):
    """
    Test that duplicate recipe titles are rejected.
    """
    # Create first recipe
    await clean_db.recipe.create(data={
        "title": "Duplicate Recipe",
        "servings": 1,
        "totalCalories": 100,
        "totalProtein": 20,
        "totalCarbs": 10,
        "totalFat": 5
    })

    # Try to create recipe with same title
    recipe_data = {
        "title": "Duplicate Recipe",
        "servings": 1,
        "ingredients": [],
        "steps": []
    }

    response = await api_client.post("/recipes/manual", json=recipe_data)
    assert response.status_code == 409
    data = response.json()
    assert "already exists" in data["detail"].lower()


@pytest.mark.asyncio
async def test_get_recipes_supports_query_filter_sort_and_limit(api_client, clean_db):
    await clean_db.recipe.create(data={
        "title": "Alpha Salad",
        "description": "Fresh greens",
        "servings": 1,
        "totalCalories": 220,
        "totalProtein": 12,
        "totalCarbs": 18,
        "totalFat": 9
    })
    await clean_db.recipe.create(data={
        "title": "Beta Chicken Bowl",
        "description": "High protein",
        "servings": 2,
        "totalCalories": 640,
        "totalProtein": 55,
        "totalCarbs": 42,
        "totalFat": 21
    })
    await clean_db.recipe.create(data={
        "title": "Gamma Oats",
        "description": "Breakfast",
        "servings": 1,
        "totalCalories": 410,
        "totalProtein": 20,
        "totalCarbs": 56,
        "totalFat": 11
    })

    response = await api_client.get(
        "/recipes?q=bowl&minCalories=500&minProtein=40&sortBy=totalCalories&sortOrder=desc&limit=5"
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Beta Chicken Bowl"


@pytest.mark.asyncio
async def test_get_recipes_supports_offset_pagination(api_client, clean_db):
    await clean_db.recipe.create(data={
        "title": "A Recipe",
        "servings": 1,
        "totalCalories": 100,
        "totalProtein": 10,
        "totalCarbs": 5,
        "totalFat": 3
    })
    await clean_db.recipe.create(data={
        "title": "B Recipe",
        "servings": 1,
        "totalCalories": 200,
        "totalProtein": 12,
        "totalCarbs": 7,
        "totalFat": 4
    })
    await clean_db.recipe.create(data={
        "title": "C Recipe",
        "servings": 1,
        "totalCalories": 300,
        "totalProtein": 14,
        "totalCarbs": 9,
        "totalFat": 5
    })

    response = await api_client.get("/recipes?sortBy=title&sortOrder=asc&limit=1&offset=1")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "B Recipe"


@pytest.mark.asyncio
async def test_get_recipes_rejects_invalid_sort_fields(api_client):
    response = await api_client.get("/recipes?sortBy=invalidField")
    assert response.status_code == 400
    assert "Invalid sortBy" in response.json()["detail"]
