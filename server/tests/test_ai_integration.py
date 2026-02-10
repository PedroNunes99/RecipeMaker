"""
Integration tests for AI recipe generation system.
Tests Ollama integration, ingredient matching, and full AI service flow.
"""

import pytest
from services.ollama_client import OllamaClient
from services.ingredient_matcher import IngredientMatcher
from services.ai_service import AIService


@pytest.mark.asyncio
async def test_ollama_health_check():
    """Test if Ollama client can check availability"""
    client = OllamaClient()
    is_available = await client.is_available()
    assert isinstance(is_available, bool)
    # Note: Test passes regardless of whether Ollama is running


@pytest.mark.asyncio
async def test_ingredient_exact_match(clean_db, multiple_ingredients):
    """Test exact ingredient name matching"""
    chicken = multiple_ingredients[0]  # Chicken Breast
    matcher = IngredientMatcher(clean_db)
    result = await matcher.match_ingredient("Chicken Breast")
    assert result is not None
    assert result.name == chicken.name


@pytest.mark.asyncio
async def test_ingredient_fuzzy_match(clean_db, multiple_ingredients):
    """Test case-insensitive fuzzy matching"""
    matcher = IngredientMatcher(clean_db)
    result = await matcher.match_ingredient("chicken breast")  # lowercase
    assert result is not None
    assert "chicken" in result.name.lower()


@pytest.mark.asyncio
async def test_ingredient_no_match_creates_placeholder(clean_db):
    """Test placeholder creation for unknown ingredients"""
    matcher = IngredientMatcher(clean_db)

    # Search for non-existent ingredient
    result = await matcher.match_ingredient("Unicorn Meat")
    assert result is None  # Should not find match

    # Create placeholder via batch matching
    ai_ingredients = [
        {"name": "Unicorn Meat", "quantity": 100, "unit": "g"}
    ]
    matched = await matcher.match_ingredients_batch(ai_ingredients)

    assert len(matched) == 1
    assert matched[0]["name"] == "Unicorn Meat"
    assert "id" in matched[0]  # Has database ID
    assert "ingredientId" in matched[0]  # Has ingredient reference


@pytest.mark.asyncio
async def test_ingredient_batch_matching(clean_db, multiple_ingredients):
    """Test batch ingredient matching with mixed results"""
    matcher = IngredientMatcher(clean_db)

    ai_ingredients = [
        {"name": "Chicken Breast", "quantity": 300, "unit": "g"},  # Exact match
        {"name": "broccoli", "quantity": 200, "unit": "g"},  # Fuzzy match (lowercase)
        {"name": "Magic Beans", "quantity": 50, "unit": "g"}  # No match (placeholder)
    ]

    matched = await matcher.match_ingredients_batch(ai_ingredients)

    assert len(matched) == 3

    # Check chicken matched
    assert matched[0]["name"] == "Chicken Breast"
    assert matched[0]["quantity"] == 300
    assert "id" in matched[0]

    # Check broccoli matched (fuzzy)
    assert "broccoli" in matched[1]["name"].lower()
    assert matched[1]["quantity"] == 200

    # Check magic beans created as placeholder
    assert matched[2]["name"] == "Magic Beans"
    assert "id" in matched[2]  # Placeholder has database ID


@pytest.mark.asyncio
async def test_ai_service_fallback():
    """Test AIService with mock fallback when Ollama offline"""
    service = AIService()
    recipe = await service.generate_recipe_from_prompt("Simple pasta")

    # Should return recipe structure even if Ollama offline
    assert "title" in recipe
    assert "ingredients" in recipe
    assert "steps" in recipe
    assert len(recipe["ingredients"]) > 0

    # Ingredients should have IDs (matched to database)
    assert "id" in recipe["ingredients"][0]
    assert "ingredientId" in recipe["ingredients"][0]


@pytest.mark.asyncio
async def test_ai_service_with_real_prompt(clean_db, multiple_ingredients):
    """Test AI service with realistic prompt"""
    service = AIService()

    prompt = "A high-protein chicken recipe for 2 people"
    recipe = await service.generate_recipe_from_prompt(prompt)

    # Verify recipe structure
    assert recipe["title"]
    assert isinstance(recipe["servings"], int)
    assert recipe["servings"] > 0

    # Verify ingredients have full data (matched to DB)
    assert len(recipe["ingredients"]) > 0
    for ing in recipe["ingredients"]:
        assert "id" in ing
        assert "name" in ing
        assert "calories" in ing
        assert "protein" in ing
        assert "quantity" in ing
        assert "unit" in ing
        assert "ingredientId" in ing

    # Verify steps
    assert len(recipe["steps"]) > 0
    for step in recipe["steps"]:
        assert "order" in step
        assert "instruction" in step
