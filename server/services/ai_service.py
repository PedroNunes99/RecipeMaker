from agents.cooking_expert import CookingExpertAgent
from typing import List, Dict, Any

class AIService:
    def __init__(self):
        self.agent = CookingExpertAgent()
        
    async def generate_recipe_from_prompt(self, prompt: str) -> Dict[str, Any]:
        """
        Generates a full recipe from a natural language prompt.
        """
        return await self.agent.generate_recipe(prompt)

    async def optimize_steps(self, raw_steps: List[str]) -> List[Dict[str, Any]]:
        """
        Takes a list of raw step strings or bullet points and optimizes them.
        """
        return await self.agent.optimize_steps(raw_steps)
