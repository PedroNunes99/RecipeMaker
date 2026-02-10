"""
Service for interacting with USDA FoodData Central API.
Provides access to 380,000+ foods with comprehensive nutrition data.
"""

from typing import List, Dict, Any, Optional
import requests
import os
from dotenv import load_dotenv

load_dotenv()


class USDAService:
    """
    Service for searching and retrieving food data from USDA FoodData Central.

    API Documentation: https://fdc.nal.usda.gov/api-guide.html
    """

    BASE_URL = "https://api.nal.usda.gov/fdc/v1"

    def __init__(self):
        self.api_key = os.getenv("USDA_API_KEY")
        if not self.api_key:
            raise ValueError("USDA_API_KEY not found in environment variables")

    def search_foods(self, query: str, page_size: int = 25) -> List[Dict[str, Any]]:
        """
        Search for foods in USDA database.

        Args:
            query: Search term (e.g., "chicken breast", "broccoli")
            page_size: Number of results to return (max 200)

        Returns:
            List of food items with basic information
        """
        url = f"{self.BASE_URL}/foods/search"

        params = {
            "api_key": self.api_key,
            "query": query,
            "pageSize": min(page_size, 200),  # USDA max is 200
            "dataType": ["Foundation", "SR Legacy"],  # Focus on basic ingredients
            "sortBy": "dataType.keyword",
            "sortOrder": "asc"
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            foods = data.get("foods", [])

            # Transform to simpler format
            results = []
            for food in foods:
                results.append(self._format_search_result(food))

            return results

        except requests.exceptions.RequestException as e:
            print(f"USDA API error: {e}")
            return []

    def get_food_details(self, fdc_id: int) -> Optional[Dict[str, Any]]:
        """
        Get detailed nutrition information for a specific food.

        Args:
            fdc_id: USDA FoodData Central ID

        Returns:
            Detailed food information with complete nutrition data
        """
        url = f"{self.BASE_URL}/food/{fdc_id}"

        params = {
            "api_key": self.api_key,
            "format": "full"
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            food = response.json()
            return self._format_food_details(food)

        except requests.exceptions.RequestException as e:
            print(f"USDA API error: {e}")
            return None

    def _format_search_result(self, food: Dict) -> Dict[str, Any]:
        """Format USDA search result into simplified structure."""

        # Extract basic nutrients (per 100g)
        nutrients = {}
        for nutrient in food.get("foodNutrients", []):
            nutrient_name = nutrient.get("nutrientName", "").lower()
            nutrient_value = nutrient.get("value", 0)

            if "energy" in nutrient_name or "calor" in nutrient_name:
                nutrients["calories"] = nutrient_value
            elif "protein" in nutrient_name:
                nutrients["protein"] = nutrient_value
            elif "carbohydrate" in nutrient_name:
                nutrients["carbohydrates"] = nutrient_value
            elif "total lipid" in nutrient_name or "fat, total" in nutrient_name:
                nutrients["fats"] = nutrient_value

        return {
            "fdcId": food.get("fdcId"),
            "description": food.get("description", ""),
            "dataType": food.get("dataType", ""),
            "category": food.get("foodCategory", "Unknown"),
            "calories": nutrients.get("calories", 0),
            "protein": nutrients.get("protein", 0),
            "carbohydrates": nutrients.get("carbohydrates", 0),
            "fats": nutrients.get("fats", 0),
            "score": food.get("score", 0)  # Search relevance score
        }

    def _format_food_details(self, food: Dict) -> Dict[str, Any]:
        """Format detailed USDA food data into our ingredient structure."""

        # Extract nutrients
        nutrients = {
            "calories": 0,
            "protein": 0,
            "carbohydrates": 0,
            "fats": 0,
            "vitamins": {},
            "minerals": {}
        }

        for nutrient in food.get("foodNutrients", []):
            nutrient_name = nutrient.get("nutrient", {}).get("name", "").lower()
            nutrient_value = nutrient.get("amount", 0)
            nutrient_unit = nutrient.get("nutrient", {}).get("unitName", "")

            # Map to our structure
            if "energy" in nutrient_name:
                nutrients["calories"] = nutrient_value
            elif nutrient_name == "protein":
                nutrients["protein"] = nutrient_value
            elif "carbohydrate" in nutrient_name and "by difference" in nutrient_name:
                nutrients["carbohydrates"] = nutrient_value
            elif "total lipid" in nutrient_name or nutrient_name == "fat, total":
                nutrients["fats"] = nutrient_value
            elif "vitamin" in nutrient_name:
                nutrients["vitamins"][nutrient_name] = {
                    "amount": nutrient_value,
                    "unit": nutrient_unit
                }
            elif any(mineral in nutrient_name for mineral in ["calcium", "iron", "magnesium", "phosphorus", "potassium", "sodium", "zinc"]):
                nutrients["minerals"][nutrient_name] = {
                    "amount": nutrient_value,
                    "unit": nutrient_unit
                }

        return {
            "fdcId": food.get("fdcId"),
            "name": food.get("description", ""),
            "dataType": food.get("dataType", ""),
            "category": food.get("foodCategory", "Unknown"),
            "calories": nutrients["calories"],
            "protein": nutrients["protein"],
            "carbohydrates": nutrients["carbohydrates"],
            "fats": nutrients["fats"],
            "vitamins": nutrients["vitamins"],
            "minerals": nutrients["minerals"],
            "unit": "g",  # USDA data is per 100g
            "publicationDate": food.get("publicationDate", "")
        }

    def convert_to_ingredient_format(self, usda_food: Dict) -> Dict[str, Any]:
        """
        Convert USDA food data to our Ingredient model format.

        Args:
            usda_food: Formatted USDA food data from get_food_details()

        Returns:
            Dictionary ready to be inserted into Ingredient table
        """
        import json

        # Determine category based on USDA data
        category_map = {
            "vegetables": "Vegetable",
            "fruits": "Fruit",
            "dairy": "Dairy",
            "meat": "Protein",
            "poultry": "Protein",
            "fish": "Protein",
            "legumes": "Protein",
            "grains": "Grain",
            "cereals": "Grain",
            "nuts": "Nuts",
            "fats": "Oils",
            "oils": "Oils",
            "spices": "Seasoning",
            "herbs": "Seasoning"
        }

        # Handle category (can be string or dict from USDA API)
        usda_category_raw = usda_food.get("category", "")
        if isinstance(usda_category_raw, dict):
            usda_category = usda_category_raw.get("description", "").lower()
        else:
            usda_category = str(usda_category_raw).lower()

        category = "Other"
        for key, value in category_map.items():
            if key in usda_category:
                category = value
                break

        return {
            "name": usda_food["name"],
            "calories": float(usda_food.get("calories", 0)),
            "protein": float(usda_food.get("protein", 0)),
            "carbohydrates": float(usda_food.get("carbohydrates", 0)),
            "fats": float(usda_food.get("fats", 0)),
            "vitamins": json.dumps(usda_food.get("vitamins", {})) if usda_food.get("vitamins") else None,
            "minerals": json.dumps(usda_food.get("minerals", {})) if usda_food.get("minerals") else None,
            "unit": "g",
            "category": category
        }
