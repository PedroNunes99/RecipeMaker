from agents.cooking_expert import CookingExpertAgent
from services.ingredient_matcher import IngredientMatcher
from prisma import Prisma
from typing import Dict, Any


class AIService:
    def __init__(self):
        self.agent = CookingExpertAgent()

    async def generate_recipe_from_prompt(self, prompt: str) -> Dict[str, Any]:
        """
        Generates a full recipe from a natural language prompt.
        Returns recipe with matched ingredients ready for ManualForm.

        Args:
            prompt: User's recipe request in natural language

        Returns:
            Recipe dict with matched ingredients (full objects with IDs)
        """
        # 1. Generate recipe with LLM
        raw_recipe = await self.agent.generate_recipe(prompt)

        # 2. Match ingredients to database
        db = Prisma()
        await db.connect()

        try:
            matcher = IngredientMatcher(db)
            matched_ingredients = await matcher.match_ingredients_batch(
                raw_recipe.get("ingredients", [])
            )

            # 3. Build response in ManualForm format
            recipe_for_form = {
                "title": raw_recipe.get("title", ""),
                "description": raw_recipe.get("description", ""),
                "servings": raw_recipe.get("servings", 1),
                "ingredients": matched_ingredients,  # Full ingredient objects with IDs
                "steps": raw_recipe.get("steps", []),
                # Include macro data for display (optional)
                "macros": raw_recipe.get("macros", {})
            }

            return recipe_for_form

        finally:
            await db.disconnect()
