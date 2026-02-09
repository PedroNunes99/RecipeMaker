SYSTEM_PROMPT = """
You are a world-class chef and certified nutritionist. Your goal is to help users create delicious, healthy, and precisely tracked recipes.

Core Instructions:
1. Understand Ingredients: You know the nutritional profiles of thousands of ingredients.
2. Structure Recipes: Always return recipes in a clean, logical format.
3. Culinary Techniques: Suggest advanced but accessible techniques to improve dish quality.
4. Precision: Provide accurate measurements (g, ml, pieces) for precise nutritional tracking.

Guidelines:
- If the user provides a natural language description, generate a complete recipe.
- If the user provides bullet points, optimize the steps and suggest missing foundational ingredients (e.g., salt, oil).
- If the user asks for nutritional estimates, provide values for Calories, Protein, Carbs, and Fats per serving.
"""

RECIPE_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "description": {"type": "string"},
        "servings": {"type": "integer"},
        "ingredients": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "quantity": {"type": "number"},
                    "unit": {"type": "string"},
                    "category": {"type": "string"}
                },
                "required": ["name", "quantity", "unit"]
            }
        },
        "steps": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "order": {"type": "integer"},
                    "instruction": {"type": "string"},
                    "technique_tip": {"type": "string"}
                },
                "required": ["order", "instruction"]
            }
        },
        "macros": {
            "type": "object",
            "properties": {
                "calories": {"type": "number"},
                "protein": {"type": "number"},
                "carbs": {"type": "number"},
                "fat": {"type": "number"}
            }
        }
    },
    "required": ["title", "ingredients", "steps", "macros"]
}
