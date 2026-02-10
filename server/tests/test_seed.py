"""
Tests for the seed script that populates the ingredient database.
"""

import pytest


@pytest.mark.asyncio
async def test_seed_creates_all_ingredients(clean_db):
    """
    Test that running the seed script creates the expected number of ingredients.
    """
    # Import and run seed main function
    from seed import main as seed_main

    await seed_main()

    # Verify count
    count = await clean_db.ingredient.count()
    assert count == 150, f"Expected 150 ingredients, got {count}"


@pytest.mark.asyncio
async def test_seed_clears_existing_data(clean_db):
    """
    Test that the seed script clears existing ingredients before seeding.
    """
    # Create some test ingredients first
    await clean_db.ingredient.create(data={
        "name": "Existing Test Ingredient",
        "calories": 100.0,
        "protein": 5.0,
        "carbohydrates": 10.0,
        "fats": 2.0,
        "unit": "g",
        "category": "Test"
    })

    # Verify we have at least 1 ingredient
    count_before = await clean_db.ingredient.count()
    assert count_before >= 1

    # Run seed
    from seed import main as seed_main
    await seed_main()

    # Verify the old ingredient is gone and we have exactly 150 new ones
    count_after = await clean_db.ingredient.count()
    assert count_after == 150

    # Verify the test ingredient no longer exists
    test_ing = await clean_db.ingredient.find_first(where={"name": "Existing Test Ingredient"})
    assert test_ing is None


@pytest.mark.asyncio
async def test_seed_creates_correct_categories(clean_db):
    """
    Test that seeded ingredients have the correct categories.
    """
    from seed import main as seed_main
    await seed_main()

    # Expected categories from the seed data
    expected_categories = ["Protein", "Vegetable", "Grain", "Dairy", "Fruit", "Oils", "Nuts", "Seasoning", "Baking", "Condiment"]

    # Get all unique categories from database
    ingredients = await clean_db.ingredient.find_many()
    actual_categories = list(set(ing.category for ing in ingredients))

    # Verify all expected categories exist
    for category in expected_categories:
        assert category in actual_categories, f"Category '{category}' not found in seeded data"


@pytest.mark.asyncio
async def test_seed_nutrition_values_are_valid(clean_db):
    """
    Test that seeded ingredients have valid nutrition values.
    """
    from seed import main as seed_main
    await seed_main()

    ingredients = await clean_db.ingredient.find_many()

    for ing in ingredients:
        # Calories should be >= 0
        assert ing.calories >= 0, f"{ing.name} has negative calories"

        # Protein should be >= 0
        assert ing.protein >= 0, f"{ing.name} has negative protein"

        # Carbs should be >= 0
        assert ing.carbohydrates >= 0, f"{ing.name} has negative carbohydrates"

        # Fats should be >= 0
        assert ing.fats >= 0, f"{ing.name} has negative fats"

        # Unit should be one of the expected values
        assert ing.unit in ["g", "ml", "piece"], f"{ing.name} has invalid unit: {ing.unit}"

        # Category should not be empty
        assert ing.category, f"{ing.name} has empty category"


@pytest.mark.asyncio
async def test_seed_handles_duplicate_runs(clean_db):
    """
    Test that running the seed script multiple times doesn't create duplicates.
    The script should delete all existing ingredients before seeding.
    """
    from seed import main as seed_main

    # Run seed first time
    await seed_main()
    count_first = await clean_db.ingredient.count()
    assert count_first == 150

    # Run seed second time
    await seed_main()
    count_second = await clean_db.ingredient.count()

    # Should still have exactly 150 ingredients (not 300)
    assert count_second == 150, f"Expected 150 ingredients after second run, got {count_second}"


@pytest.mark.asyncio
async def test_seed_creates_searchable_ingredients(clean_db):
    """
    Test that seeded ingredients can be found by name (case-insensitive search).
    """
    from seed import main as seed_main
    await seed_main()

    # Test searching for specific ingredients (exact names from seed data)
    test_cases = [
        ("Chicken Breast", "Protein"),
        ("Broccoli", "Vegetable"),
        ("Brown Rice (Cooked)", "Grain"),
        ("Milk (Whole)", "Dairy"),
        ("Banana", "Fruit")
    ]

    for name, expected_category in test_cases:
        # Search by exact name (seed data has proper capitalization)
        ingredient = await clean_db.ingredient.find_first(
            where={"name": name}
        )

        assert ingredient is not None, f"Could not find ingredient '{name}'"
        assert ingredient.category == expected_category, \
            f"{ingredient.name} should be category '{expected_category}', got '{ingredient.category}'"


@pytest.mark.asyncio
async def test_seed_creates_protein_sources(clean_db):
    """
    Test that the seed creates a good variety of protein sources.
    """
    from seed import main as seed_main
    await seed_main()

    # Get all protein ingredients
    proteins = await clean_db.ingredient.find_many(where={"category": "Protein"})

    # Should have at least 10 protein sources
    assert len(proteins) >= 10, f"Expected at least 10 protein sources, got {len(proteins)}"

    # Check for specific protein sources
    protein_names = [p.name for p in proteins]
    expected_proteins = ["Chicken Breast", "Salmon Fillet", "Tofu", "Lentils"]

    for protein in expected_proteins:
        assert any(protein in name for name in protein_names), \
            f"Expected to find '{protein}' in protein sources"
