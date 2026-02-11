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

            # 3. Normalize steps to always include notes
            raw_steps = raw_recipe.get("steps", [])
            normalized_steps = [
                {
                    "order": s.get("order", i + 1),
                    "instruction": s.get("instruction", ""),
                    "notes": s.get("notes", None)
                }
                for i, s in enumerate(raw_steps)
            ]

            # 4. Build response in ManualForm format
            recipe_for_form = {
                "title": raw_recipe.get("title", ""),
                "description": raw_recipe.get("description", ""),
                "servings": raw_recipe.get("servings", 1),
                "ingredients": matched_ingredients,
                "steps": normalized_steps,
                "macros": raw_recipe.get("macros", {})
            }

            return recipe_for_form

        finally:
            await db.disconnect()
