from agents.prompts import SYSTEM_PROMPT, RECIPE_EXAMPLE
from services.ollama_client import OllamaClient
import json
import re
from typing import Dict, Any


class CookingExpertAgent:
    """
    An agent that specializes in recipe generation using local LLM (Ollama)
    """

    def __init__(self):
        self.ollama = OllamaClient()
        self.system_prompt = SYSTEM_PROMPT

    async def generate_recipe(self, prompt: str) -> Dict[str, Any]:
        """
        Generates a recipe using Ollama LLM
        Falls back to mock if Ollama unavailable

        Args:
            prompt: User's recipe request

        Returns:
            Recipe dict with title, ingredients, steps, macros
        """
        # Check if Ollama is available
        is_available = await self.ollama.is_available()

        if not is_available:
            print("Ollama unavailable, using mock data")
            return await self._generate_mock_recipe(prompt)

        # Build the full prompt with example-based instructions
        full_prompt = f"""Create a recipe for: {prompt}

You MUST respond with ONLY a JSON object, no other text. Follow this exact format:

{RECIPE_EXAMPLE}

Now generate a different recipe based on the user's request above. Output ONLY valid JSON, nothing else."""

        # Generate recipe with Ollama
        response = await self.ollama.generate(
            prompt=full_prompt,
            system_prompt=self.system_prompt,
            temperature=0.7,
            max_tokens=2048
        )

        if not response:
            print("Ollama generation failed, using mock data")
            return await self._generate_mock_recipe(prompt)

        # Parse JSON from response
        try:
            recipe_data = self._extract_json(response)
            return recipe_data
        except Exception as e:
            print(f"Failed to parse Ollama response: {e}")
            print(f"Raw response: {response[:500]}")  # Log first 500 chars
            return await self._generate_mock_recipe(prompt)

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """
        Extract JSON from LLM response (handles markdown code blocks, schema wrapping)

        Args:
            text: Raw LLM response

        Returns:
            Parsed JSON dict with title, ingredients, steps, macros

        Raises:
            ValueError: If no valid JSON found
        """
        text = text.strip()

        # Try direct JSON parse first
        try:
            parsed = json.loads(text)
            return self._unwrap_schema(parsed)
        except (json.JSONDecodeError, ValueError):
            pass

        # Try to extract from markdown code block
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(1))
                return self._unwrap_schema(parsed)
            except (json.JSONDecodeError, ValueError):
                pass

        # Try to find JSON object in text (use lazy matching to avoid nested issues)
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(0))
                return self._unwrap_schema(parsed)
            except (json.JSONDecodeError, ValueError):
                pass

        # Last resort: try greedy match
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(0))
                return self._unwrap_schema(parsed)
            except (json.JSONDecodeError, ValueError):
                pass

        raise ValueError("No valid JSON found in response")

    def _unwrap_schema(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        If the LLM wrapped recipe data inside a JSON Schema structure,
        extract the actual values from the 'properties' field.
        """
        if "properties" in data and "title" not in data and isinstance(data["properties"], dict):
            props = data["properties"]
            if "title" in props:
                return props
        return data

    async def _generate_mock_recipe(self, prompt: str) -> Dict[str, Any]:
        """
        Fallback mock response for testing/development

        Args:
            prompt: User's recipe request

        Returns:
            Mock recipe dict
        """
        return {
            "title": f"Mock Recipe: {prompt[:30]}",
            "description": f"AI-generated recipe based on: {prompt}",
            "servings": 2,
            "ingredients": [
                {"name": "Chicken Breast", "quantity": 300, "unit": "g", "category": "Meat"},
                {"name": "Olive Oil", "quantity": 15, "unit": "ml", "category": "Oils"},
                {"name": "Broccoli", "quantity": 200, "unit": "g", "category": "Vegetable"}
            ],
            "steps": [
                {"order": 1, "instruction": "Preheat pan with olive oil on medium heat", "notes": "Use a non-stick pan for best results."},
                {"order": 2, "instruction": "Season chicken and cook for 6-7 minutes per side", "notes": "Internal temperature should reach 165F (74C)."},
                {"order": 3, "instruction": "Steam broccoli until tender", "notes": None}
            ],
            "macros": {
                "calories": 450,
                "protein": 45,
                "carbs": 20,
                "fat": 15
            }
        }
