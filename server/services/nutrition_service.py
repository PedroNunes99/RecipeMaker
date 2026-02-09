from typing import List, Dict

class NutritionService:
    @staticmethod
    def calculate_recipe_totals(recipe_ingredients: List[Dict]):
        """
        recipe_ingredients: List of dicts with {ingredient: Ingredient, quantity: float, unit: str}
        """
        totals = {
            "calories": 0.0,
            "protein": 0.0,
            "carbs": 0.0,
            "fat": 0.0
        }
        
        for item in recipe_ingredients:
            ing = item['ingredient']
            qty = item['quantity']
            unit = item['unit']
            
            # Simplified calculation based on 100g/ml or per unit
            # In a real app, unit conversion would be handled here
            factor = qty / 100.0 if unit in ['g', 'ml'] else qty
            
            totals['calories'] += ing.calories * factor
            totals['protein'] += ing.protein * factor
            totals['carbs'] += ing.carbohydrates * factor
            totals['fat'] += ing.fats * factor
            
        return totals
