"""
Shared pytest fixtures for backend testing.
Provides database, API client, and sample data fixtures.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from prisma import Prisma


@pytest_asyncio.fixture
async def db():
    """
    Provides a Prisma database client for tests.
    Connects before the test and disconnects after.
    """
    client = Prisma()
    await client.connect()
    yield client
    await client.disconnect()


@pytest_asyncio.fixture
async def clean_db(db):
    """
    Provides a clean database for each test.
    Deletes all data before the test runs.
    """
    # Clean all tables in reverse dependency order
    await db.recipeingredient.delete_many()
    await db.recipestep.delete_many()
    await db.recipe.delete_many()
    await db.ingredient.delete_many()
    await db.recipelist.delete_many()
    await db.user.delete_many()

    yield db

    # Optional: Clean up after test as well
    await db.recipeingredient.delete_many()
    await db.recipestep.delete_many()
    await db.recipe.delete_many()
    await db.ingredient.delete_many()
    await db.recipelist.delete_many()
    await db.user.delete_many()


@pytest_asyncio.fixture
async def api_client(db):
    """
    Provides an async HTTP client for testing API endpoints.
    Ensures the app's database connection is set up for tests.
    """
    from main import app, db as app_db

    # Connect the app's database for testing
    if not app_db.is_connected():
        await app_db.connect()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # Disconnect after tests
    if app_db.is_connected():
        await app_db.disconnect()


@pytest.fixture
def sample_ingredient_data():
    """
    Provides sample ingredient data for testing.
    Returns a dictionary with ingredient fields.
    """
    return {
        "name": "Test Chicken Breast",
        "calories": 165.0,
        "protein": 31.0,
        "carbohydrates": 0.0,
        "fats": 3.6,
        "unit": "g",
        "category": "Protein"
    }


@pytest.fixture
def sample_ingredients_list():
    """
    Provides a list of sample ingredients for bulk testing.
    """
    return [
        {
            "name": "Chicken Breast",
            "calories": 165.0,
            "protein": 31.0,
            "carbohydrates": 0.0,
            "fats": 3.6,
            "unit": "g",
            "category": "Protein"
        },
        {
            "name": "Broccoli",
            "calories": 34.0,
            "protein": 2.8,
            "carbohydrates": 7.0,
            "fats": 0.4,
            "unit": "g",
            "category": "Vegetable"
        },
        {
            "name": "Brown Rice",
            "calories": 111.0,
            "protein": 2.6,
            "carbohydrates": 23.0,
            "fats": 0.9,
            "unit": "g",
            "category": "Grain"
        }
    ]


@pytest.fixture
def sample_recipe_data():
    """
    Provides sample recipe data for testing recipe creation.
    """
    return {
        "title": "Test Recipe",
        "description": "A test recipe for unit testing",
        "servings": 4
    }


@pytest_asyncio.fixture
async def sample_ingredient(clean_db, sample_ingredient_data):
    """
    Creates and returns a sample ingredient in the database.
    Useful for tests that need an existing ingredient.
    """
    ingredient = await clean_db.ingredient.create(data=sample_ingredient_data)
    return ingredient


@pytest_asyncio.fixture
async def multiple_ingredients(clean_db, sample_ingredients_list):
    """
    Creates and returns multiple sample ingredients in the database.
    """
    ingredients = []
    for ing_data in sample_ingredients_list:
        ing = await clean_db.ingredient.create(data=ing_data)
        ingredients.append(ing)
    return ingredients
