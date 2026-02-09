from agents.prompts import SYSTEM_PROMPT, RECIPE_SCHEMA
import json
from typing import List, Dict, Any

class CookingExpertAgent:
    """
    An agent that specializes in recipe generation, optimization, and nutritional analysis.
    """
    
    def __init__(self, model_name: str = "gemini-1.5-pro"):
        self.model_name = model_name
        self.system_prompt = SYSTEM_PROMPT

    async def generate_recipe(self, prompt: str, mode: str = "freestyle") -> Dict[str, Any]:
        """
        Generates a recipe. 
        In a live environment, this would call an LLM with structured output.
        """
        # Simulated LLM processing
        if mode == "assisted":
            return await self._simulate_assisted_mode(prompt)
        return await self._simulate_freestyle_mode(prompt)

    async def _simulate_freestyle_mode(self, prompt: str) -> Dict[str, Any]:
        # Realistic mock response based on prompts
        return {
            "title": f"Premium {prompt.title()}",
            "description": f"A chef-optimized take on your request: {prompt}",
            "servings": 2,
            "ingredients": [
                {"name": "Organic Chicken Breast", "quantity": 300, "unit": "g", "category": "Meat"},
                {"name": "Avocado oil", "quantity": 15, "unit": "ml", "category": "Oils"},
                {"name": "Sweet Potato", "quantity": 200, "unit": "g", "category": "Vegetable"}
            ],
            "steps": [
                {"order": 1, "instruction": "Preheat your pan to medium-high heat with Avocado oil.", "technique_tip": "High smoke point oils like avocado are best for searing."},
                {"order": 2, "instruction": "Season chicken generously and sear for 6-7 minutes per side.", "technique_tip": "Don't move the meat too early to ensure a deep golden crust."}
            ],
            "macros": {
                "calories": 480,
                "protein": 35,
                "carbs": 25,
                "fat": 18
            }
        }

    async def _simulate_assisted_mode(self, input_data: str) -> Dict[str, Any]:
        # Optimization logic for bullet points
        return {
            "title": "Optimized Creation",
            "description": "Cleaned and structured based on your provided ingredients.",
            "servings": 1,
            "ingredients": [
                {"name": "Miso Paste", "quantity": 30, "unit": "g", "category": "Seasoning"},
                {"name": "Salmon Fillet", "quantity": 150, "unit": "g", "category": "Fish"}
            ],
            "steps": [
                {"order": 1, "instruction": "Whisk miso with a splash of warm water.", "technique_tip": "Creates a smooth glaze that won't clump."},
                {"order": 2, "instruction": "Brush over salmon and bake at 200°C for 12 minutes."}
            ],
            "macros": {
                "calories": 320,
                "protein": 28,
                "carbs": 5,
                "fat": 20
            }
        }

    async def optimize_steps(self, raw_steps: List[str]) -> List[Dict[str, Any]]:
        # Logic to re-order and professionally rephrase cooking steps
        return [{"order": i+1, "instruction": s} for i, s in enumerate(raw_steps)]

    async def extract_nutrients(self, ingredient_name: str) -> Dict[str, float]:
        # Logic to parse ingredient strings or query nutrition APIs
        return {
            "calories": 100.0,
            "protein": 5.0,
            "carbohydrates": 20.0,
            "fats": 2.0
        }
