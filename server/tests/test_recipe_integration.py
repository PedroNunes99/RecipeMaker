"""
End-to-end integration tests for recipe management flow.
Tests the complete CRUD cycle: Create → Read → Update → Delete
"""

import pytest


@pytest.mark.asyncio
async def test_complete_recipe_crud_flow(api_client, multiple_ingredients):
    """
    Test the complete CRUD flow: Create → Read → Update → Delete.
    Verifies that nutrition is calculated correctly throughout the lifecycle.
    """
    chicken = multiple_ingredients[0]  # 165 cal, 31g protein per 100g
    broccoli = multiple_ingredients[1]  # 34 cal, 2.8g protein per 100g
    rice = multiple_ingredients[2]  # 111 cal, 2.6g protein per 100g

    # ===== CREATE =====
    create_data = {
        "title": "Integration Test Recipe",
        "description": "Testing full CRUD flow",
        "servings": 2,
        "ingredients": [
            {"ingredientId": chicken.id, "quantity": 200, "unit": "g"}  # 330 cal, 62g protein
        ],
        "steps": [
            {"order": 1, "instruction": "Cook chicken"}
        ]
    }

    create_response = await api_client.post("/recipes/manual", json=create_data)
    assert create_response.status_code == 200
    recipe = create_response.json()
    recipe_id = recipe["id"]

    # Verify nutrition was calculated (200g chicken)
    assert recipe["totalCalories"] == pytest.approx(330, rel=0.01)
    assert recipe["totalProtein"] == pytest.approx(62, rel=0.01)

    # ===== READ =====
    read_response = await api_client.get(f"/recipes/{recipe_id}")
    assert read_response.status_code == 200
    read_data = read_response.json()
    assert read_data["title"] == "Integration Test Recipe"
    assert read_data["totalCalories"] == pytest.approx(330, rel=0.01)

    # ===== UPDATE =====
    # Change title and add more ingredients
    update_data = {
        "title": "Updated Integration Recipe",
        "ingredients": [
            {"ingredientId": chicken.id, "quantity": 150, "unit": "g"},  # 247.5 cal, 46.5g protein
            {"ingredientId": broccoli.id, "quantity": 100, "unit": "g"},  # 34 cal, 2.8g protein
            {"ingredientId": rice.id, "quantity": 100, "unit": "g"}  # 111 cal, 2.6g protein
        ],
        "steps": [
            {"order": 1, "instruction": "Cook chicken and rice"},
            {"order": 2, "instruction": "Steam broccoli"},
            {"order": 3, "instruction": "Combine and serve"}
        ]
    }

    update_response = await api_client.put(f"/recipes/{recipe_id}", json=update_data)
    assert update_response.status_code == 200
    updated_recipe = update_response.json()

    # Verify title was updated
    assert updated_recipe["title"] == "Updated Integration Recipe"

    # Verify nutrition was recalculated (150g chicken + 100g broccoli + 100g rice)
    # 150g chicken: 247.5 cal, 46.5g protein, 0g carbs, 5.4g fat
    # 100g broccoli: 34 cal, 2.8g protein, 7g carbs, 0.4g fat
    # 100g rice: 111 cal, 2.6g protein, 23g carbs, 0.9g fat
    # Total: 392.5 cal, 51.9g protein, 30g carbs, 6.7g fat
    assert updated_recipe["totalCalories"] == pytest.approx(392.5, rel=0.01)
    assert updated_recipe["totalProtein"] == pytest.approx(51.9, rel=0.01)
    assert updated_recipe["totalCarbs"] == pytest.approx(30.0, rel=0.01)
    assert updated_recipe["totalFat"] == pytest.approx(6.7, rel=0.01)

    # Verify steps were updated
    assert len(updated_recipe["steps"]) == 3

    # ===== DELETE =====
    delete_response = await api_client.delete(f"/recipes/{recipe_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == "Recipe deleted successfully"

    # Verify recipe was deleted
    get_deleted_response = await api_client.get(f"/recipes/{recipe_id}")
    assert get_deleted_response.status_code == 404


@pytest.mark.asyncio
async def test_recipe_search_integration(api_client, clean_db, multiple_ingredients):
    """
    Test recipe search functionality with multiple recipes.
    """
    chicken = multiple_ingredients[0]

    # Create multiple recipes
    recipes_to_create = [
        {
            "title": "Grilled Chicken Salad",
            "description": "Healthy and delicious",
            "servings": 2,
            "ingredients": [{"ingredientId": chicken.id, "quantity": 150, "unit": "g"}],
            "steps": [{"order": 1, "instruction": "Grill chicken"}]
        },
        {
            "title": "Chicken Soup",
            "description": "Warm and comforting",
            "servings": 4,
            "ingredients": [{"ingredientId": chicken.id, "quantity": 200, "unit": "g"}],
            "steps": [{"order": 1, "instruction": "Boil chicken"}]
        },
        {
            "title": "Beef Stir Fry",
            "description": "Quick and easy",
            "servings": 2,
            "ingredients": [{"ingredientId": chicken.id, "quantity": 100, "unit": "g"}],
            "steps": [{"order": 1, "instruction": "Stir fry"}]
        }
    ]

    for recipe_data in recipes_to_create:
        response = await api_client.post("/recipes/manual", json=recipe_data)
        assert response.status_code == 200

    # Search for "chicken" - should find 2 recipes
    search_response = await api_client.get("/recipes/search?q=chicken")
    assert search_response.status_code == 200
    results = search_response.json()
    assert len(results) == 2
    assert all("chicken" in r["title"].lower() for r in results)

    # Search for "beef" - should find 1 recipe
    search_response = await api_client.get("/recipes/search?q=beef")
    assert search_response.status_code == 200
    results = search_response.json()
    assert len(results) == 1
    assert "beef" in results[0]["title"].lower()

    # Search for "delicious" (in description) - should find 1 recipe
    search_response = await api_client.get("/recipes/search?q=delicious")
    assert search_response.status_code == 200
    results = search_response.json()
    assert len(results) == 1
    assert "Salad" in results[0]["title"]
