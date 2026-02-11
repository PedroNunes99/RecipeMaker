"""
Service for matching AI-generated ingredient names to database ingredients.
Uses exact matching and fuzzy matching with fallback to placeholder creation.
"""

from typing import List, Dict, Any, Optional
from prisma import Prisma
from difflib import SequenceMatcher


class IngredientMatcher:
    """
    Matches AI-generated ingredient names to database ingredients
    """

    def __init__(self, db: Prisma):
        self.db = db

    async def match_ingredient(self, name: str) -> Optional[Dict[str, Any]]:
        """
        Find best matching ingredient in database

        Args:
            name: Ingredient name from AI

        Returns:
            Ingredient with full nutrition data or None if no match
        """
        # 1. Exact match (SQLite is case-insensitive by default)
        exact_match = await self.db.ingredient.find_first(
            where={"name": name}
        )
        if exact_match:
            return exact_match

        # 2. Fuzzy match using substring and similarity
        all_ingredients = await self.db.ingredient.find_many()

        best_match = None
        best_score = 0.0

        for ing in all_ingredients:
            # Calculate similarity score
            score = self._similarity(name.lower(), ing.name.lower())

            if score > best_score and score > 0.6:  # 60% similarity threshold
                best_score = score
                best_match = ing

        return best_match

    def _similarity(self, a: str, b: str) -> float:
        """
        Calculate similarity between two strings

        Args:
            a: First string
            b: Second string

        Returns:
            Similarity score between 0 and 1
        """
        return SequenceMatcher(None, a, b).ratio()

    async def match_ingredients_batch(
        self,
        ingredient_list: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Match a list of AI ingredients to database ingredients

        Args:
            ingredient_list: List of AI-generated ingredients with name, quantity, unit

        Returns:
            List with matched ingredient data + quantity/unit in ManualForm format
        """
        matched = []

        for ai_ing in ingredient_list:
            name = ai_ing.get("name", "")
            quantity = ai_ing.get("quantity", 0)
            unit = ai_ing.get("unit", "g")

            # Try to find match
            db_ingredient = await self.match_ingredient(name)

            if db_ingredient:
                # Found match - use database nutrition data
                matched.append({
                    "id": db_ingredient.id,
                    "name": db_ingredient.name,
                    "calories": db_ingredient.calories,
                    "protein": db_ingredient.protein,
                    "carbohydrates": db_ingredient.carbohydrates,
                    "fats": db_ingredient.fats,
                    "quantity": quantity,
                    "unit": unit,
                    "ingredientId": db_ingredient.id
                })
            else:
                # No match - create placeholder with estimated values
                print(f"No match found for '{name}', creating placeholder")
                placeholder = await self._create_placeholder_ingredient(name)
                matched.append({
                    "id": placeholder.id,
                    "name": placeholder.name,
                    "calories": placeholder.calories,
                    "protein": placeholder.protein,
                    "carbohydrates": placeholder.carbohydrates,
                    "fats": placeholder.fats,
                    "quantity": quantity,
                    "unit": unit,
                    "ingredientId": placeholder.id
                })

        return matched

    async def _create_placeholder_ingredient(self, name: str) -> Any:
        """
        Create a placeholder ingredient with generic nutrition estimates

        Args:
            name: Ingredient name

        Returns:
            Created placeholder ingredient
        """
        # Check if placeholder already exists
        existing = await self.db.ingredient.find_first(
            where={"name": name}
        )

        if existing:
            return existing

        # Generic estimates for unknown ingredients (conservative values)
        placeholder = await self.db.ingredient.create(
            data={
                "name": name,
                "calories": 50.0,
                "protein": 5.0,
                "carbohydrates": 10.0,
                "fats": 1.0,
                "unit": "g",
                "category": "Unknown",
            }
        )
        return placeholder
