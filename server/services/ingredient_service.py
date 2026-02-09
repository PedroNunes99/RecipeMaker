from typing import List, Dict, Any, Optional
from prisma import Prisma

class IngredientService:
    def __init__(self):
        # In a real app, this would be an API key for Edamam or Spoonacular
        self.api_key = "MOCK_API_KEY"

    async def search_public_ingredients(self, query: str) -> List[Dict[str, Any]]:
        """
        Searches the local database for ingredients.
        """
        db = Prisma()
        await db.connect()
        
        try:
            results = await db.ingredient.find_many(
                where={
                    "name": {
                        "contains": query,
                        "mode": "insensitive"
                    }
                },
                take=50
            )
            return results
        finally:
            await db.disconnect()

    async def get_purchase_info(self, ingredient_name: str, location: str = "US") -> List[Dict[str, str]]:
        """
        Simulates getting purchase info based on location.
        """
        return [
            {"store": "Whole Foods", "link": f"https://wholefoods.com/search?q={ingredient_name}"},
            {"store": "Amazon Fresh", "link": f"https://amazon.com/s?k={ingredient_name}"},
            {"store": "Local Farmers Market", "info": "Check Saturdays 8am-12pm"}
        ]
