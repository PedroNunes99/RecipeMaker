"""
Tests for ingredient API endpoints.
Tests all CRUD operations and search functionality.
"""

import pytest


@pytest.mark.asyncio
async def test_get_ingredients_returns_list(api_client, multiple_ingredients):
    """
    Test that GET /ingredients returns a list of ingredients.
    """
    response = await api_client.get("/ingredients")

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 3  # We created 3 ingredients in the fixture


@pytest.mark.asyncio
async def test_get_ingredients_includes_nutrition(api_client, sample_ingredient):
    """
    Test that ingredient responses include all nutrition fields.
    """
    response = await api_client.get("/ingredients")

    assert response.status_code == 200
    data = response.json()

    assert len(data) > 0

    # Check first ingredient has all required fields
    ingredient = data[0]
    assert "id" in ingredient
    assert "name" in ingredient
    assert "calories" in ingredient
    assert "protein" in ingredient
    assert "carbohydrates" in ingredient
    assert "fats" in ingredient
    assert "unit" in ingredient
    assert "category" in ingredient


@pytest.mark.asyncio
async def test_search_ingredients_finds_matches(api_client, multiple_ingredients):
    """
    Test that GET /ingredients/search?q=query finds matching ingredients.
    """
    # Search for "chicken" (we created "Chicken Breast" in fixtures)
    response = await api_client.get("/ingredients/search?q=chicken")

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) > 0

    # Verify result contains "chicken" in the name
    assert any("chicken" in ing["name"].lower() for ing in data)


@pytest.mark.asyncio
async def test_search_ingredients_is_case_insensitive(api_client, multiple_ingredients):
    """
    Test that ingredient search is case-insensitive.
    """
    # Search with uppercase
    response = await api_client.get("/ingredients/search?q=CHICKEN")

    assert response.status_code == 200
    data = response.json()

    assert len(data) > 0
    assert any("chicken" in ing["name"].lower() for ing in data)


@pytest.mark.asyncio
async def test_create_ingredient_success(api_client, clean_db, sample_ingredient_data):
    """
    Test that POST /ingredients successfully creates an ingredient.
    """
    response = await api_client.post("/ingredients", json=sample_ingredient_data)

    assert response.status_code == 200
    data = response.json()

    # Verify response includes the created ingredient
    assert data["name"] == sample_ingredient_data["name"]
    assert data["calories"] == sample_ingredient_data["calories"]
    assert data["protein"] == sample_ingredient_data["protein"]
    assert "id" in data

    # Verify it was actually created in the database
    ingredient_in_db = await clean_db.ingredient.find_unique(where={"id": data["id"]})
    assert ingredient_in_db is not None
    assert ingredient_in_db.name == sample_ingredient_data["name"]


@pytest.mark.asyncio
async def test_create_ingredient_validation(api_client, clean_db):
    """
    Test that POST /ingredients validates required fields.
    """
    from prisma.errors import MissingRequiredValueError

    # Missing required fields
    invalid_data = {
        "name": "Incomplete Ingredient"
        # Missing: calories, protein, carbohydrates, fats, unit, category
    }

    # Prisma will raise an exception for missing required fields
    # In test mode with ASGITransport, this exception propagates instead of being converted to HTTP 500
    with pytest.raises(MissingRequiredValueError):
        response = await api_client.post("/ingredients", json=invalid_data)


@pytest.mark.asyncio
async def test_get_ingredient_purchase_info(api_client, sample_ingredient):
    """
    Test that GET /ingredients/{id}/purchase returns purchase information.
    """
    ingredient_id = sample_ingredient.id
    ingredient_name = sample_ingredient.name

    # Note: The endpoint takes both id and name as parameters
    response = await api_client.get(f"/ingredients/{ingredient_id}/purchase?name={ingredient_name}")

    assert response.status_code == 200
    data = response.json()

    # The purchase info endpoint might return various structures
    # Just verify it returns a valid response
    assert data is not None


@pytest.mark.asyncio
async def test_get_ingredients_empty_database(api_client, clean_db):
    """
    Test that GET /ingredients returns an empty list when database is empty.
    """
    response = await api_client.get("/ingredients")

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_search_ingredients_no_results(api_client, multiple_ingredients):
    """
    Test that searching for a non-existent ingredient returns empty list.
    """
    response = await api_client.get("/ingredients/search?q=NonExistentIngredient12345")

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 0
