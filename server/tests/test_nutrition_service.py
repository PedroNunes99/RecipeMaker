"""
Tests for the NutritionService that calculates recipe nutrition totals.
"""

import pytest
from services.nutrition_service import NutritionService


# Mock ingredient class for testing
class MockIngredient:
    def __init__(self, calories, protein, carbohydrates, fats):
        self.calories = calories
        self.protein = protein
        self.carbohydrates = carbohydrates
        self.fats = fats


def test_calculate_recipe_totals_with_grams():
    """
    Test nutrition calculation for ingredients measured in grams.
    """
    # Chicken Breast: 165 cal, 31g protein, 0g carbs, 3.6g fat per 100g
    chicken = MockIngredient(calories=165, protein=31, carbohydrates=0, fats=3.6)

    recipe_ingredients = [{
        'ingredient': chicken,
        'quantity': 200,  # 200g
        'unit': 'g'
    }]

    totals = NutritionService.calculate_recipe_totals(recipe_ingredients)

    # 200g = 2x the nutrition values (200/100 = 2)
    assert totals['calories'] == pytest.approx(330, rel=0.01)  # 165 * 2
    assert totals['protein'] == pytest.approx(62, rel=0.01)    # 31 * 2
    assert totals['carbs'] == pytest.approx(0, rel=0.01)       # 0 * 2
    assert totals['fat'] == pytest.approx(7.2, rel=0.01)       # 3.6 * 2


def test_calculate_recipe_totals_with_ml():
    """
    Test nutrition calculation for ingredients measured in ml.
    """
    # Milk: 61 cal, 3.2g protein, 4.8g carbs, 3.3g fat per 100ml
    milk = MockIngredient(calories=61, protein=3.2, carbohydrates=4.8, fats=3.3)

    recipe_ingredients = [{
        'ingredient': milk,
        'quantity': 250,  # 250ml
        'unit': 'ml'
    }]

    totals = NutritionService.calculate_recipe_totals(recipe_ingredients)

    # 250ml = 2.5x the nutrition values (250/100 = 2.5)
    assert totals['calories'] == pytest.approx(152.5, rel=0.01)  # 61 * 2.5
    assert totals['protein'] == pytest.approx(8.0, rel=0.01)     # 3.2 * 2.5
    assert totals['carbs'] == pytest.approx(12.0, rel=0.01)      # 4.8 * 2.5
    assert totals['fat'] == pytest.approx(8.25, rel=0.01)        # 3.3 * 2.5


def test_calculate_recipe_totals_with_pieces():
    """
    Test nutrition calculation for ingredients measured in pieces.
    For pieces, the factor is just the quantity (not divided by 100).
    """
    # Large Egg: 78 cal, 6.3g protein, 0.6g carbs, 5.3g fat per piece
    egg = MockIngredient(calories=78, protein=6.3, carbohydrates=0.6, fats=5.3)

    recipe_ingredients = [{
        'ingredient': egg,
        'quantity': 3,  # 3 eggs
        'unit': 'piece'
    }]

    totals = NutritionService.calculate_recipe_totals(recipe_ingredients)

    # 3 pieces = 3x the nutrition values
    assert totals['calories'] == pytest.approx(234, rel=0.01)   # 78 * 3
    assert totals['protein'] == pytest.approx(18.9, rel=0.01)   # 6.3 * 3
    assert totals['carbs'] == pytest.approx(1.8, rel=0.01)      # 0.6 * 3
    assert totals['fat'] == pytest.approx(15.9, rel=0.01)       # 5.3 * 3


def test_calculate_recipe_totals_empty_list():
    """
    Test that an empty ingredient list returns zero values.
    """
    recipe_ingredients = []

    totals = NutritionService.calculate_recipe_totals(recipe_ingredients)

    assert totals['calories'] == 0.0
    assert totals['protein'] == 0.0
    assert totals['carbs'] == 0.0
    assert totals['fat'] == 0.0


def test_calculate_recipe_totals_mixed_units():
    """
    Test nutrition calculation with a mix of different units.
    """
    chicken = MockIngredient(calories=165, protein=31, carbohydrates=0, fats=3.6)
    broccoli = MockIngredient(calories=34, protein=2.8, carbohydrates=7, fats=0.4)
    egg = MockIngredient(calories=78, protein=6.3, carbohydrates=0.6, fats=5.3)
    milk = MockIngredient(calories=61, protein=3.2, carbohydrates=4.8, fats=3.3)

    recipe_ingredients = [
        {'ingredient': chicken, 'quantity': 150, 'unit': 'g'},      # 150g
        {'ingredient': broccoli, 'quantity': 100, 'unit': 'g'},     # 100g
        {'ingredient': egg, 'quantity': 2, 'unit': 'piece'},        # 2 eggs
        {'ingredient': milk, 'quantity': 200, 'unit': 'ml'}         # 200ml
    ]

    totals = NutritionService.calculate_recipe_totals(recipe_ingredients)

    # Calculate expected values:
    # Chicken: 165*1.5 = 247.5 cal, 31*1.5 = 46.5g protein
    # Broccoli: 34*1 = 34 cal, 2.8*1 = 2.8g protein
    # Eggs: 78*2 = 156 cal, 6.3*2 = 12.6g protein
    # Milk: 61*2 = 122 cal, 3.2*2 = 6.4g protein
    # Total: 559.5 cal, 68.3g protein

    assert totals['calories'] == pytest.approx(559.5, rel=0.01)
    assert totals['protein'] == pytest.approx(68.3, rel=0.01)


def test_nutrition_calculation_accuracy():
    """
    Test that nutrition calculations are mathematically correct.
    """
    # Simple test ingredient: 100 cal, 10g protein, 20g carbs, 5g fat per 100g
    test_ing = MockIngredient(calories=100, protein=10, carbohydrates=20, fats=5)

    recipe_ingredients = [{
        'ingredient': test_ing,
        'quantity': 50,  # 50g
        'unit': 'g'
    }]

    totals = NutritionService.calculate_recipe_totals(recipe_ingredients)

    # 50g = 0.5x the nutrition values (50/100 = 0.5)
    assert totals['calories'] == pytest.approx(50, rel=0.001)     # 100 * 0.5
    assert totals['protein'] == pytest.approx(5, rel=0.001)       # 10 * 0.5
    assert totals['carbs'] == pytest.approx(10, rel=0.001)        # 20 * 0.5
    assert totals['fat'] == pytest.approx(2.5, rel=0.001)         # 5 * 0.5


def test_calculate_recipe_totals_handles_zero_quantity():
    """
    Test that zero quantity ingredients don't affect totals.
    """
    chicken = MockIngredient(calories=165, protein=31, carbohydrates=0, fats=3.6)

    recipe_ingredients = [{
        'ingredient': chicken,
        'quantity': 0,  # 0g
        'unit': 'g'
    }]

    totals = NutritionService.calculate_recipe_totals(recipe_ingredients)

    assert totals['calories'] == 0.0
    assert totals['protein'] == 0.0
    assert totals['carbs'] == 0.0
    assert totals['fat'] == 0.0


def test_calculate_recipe_totals_large_quantities():
    """
    Test calculation with large quantities.
    """
    rice = MockIngredient(calories=111, protein=2.6, carbohydrates=23, fats=0.9)

    recipe_ingredients = [{
        'ingredient': rice,
        'quantity': 1000,  # 1kg
        'unit': 'g'
    }]

    totals = NutritionService.calculate_recipe_totals(recipe_ingredients)

    # 1000g = 10x the nutrition values
    assert totals['calories'] == pytest.approx(1110, rel=0.01)
    assert totals['protein'] == pytest.approx(26, rel=0.01)
    assert totals['carbs'] == pytest.approx(230, rel=0.01)
    assert totals['fat'] == pytest.approx(9, rel=0.01)
