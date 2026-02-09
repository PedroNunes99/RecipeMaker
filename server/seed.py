import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()

    # Clear existing ingredients
    await db.ingredient.delete_many()

    ingredients_data = [
        # --- PROTEINS ---
        {"name": "Chicken Breast", "calories": 165, "protein": 31, "carbohydrates": 0, "fats": 3.6, "unit": "g", "category": "Protein"},
        {"name": "Chicken Thigh", "calories": 209, "protein": 26, "carbohydrates": 0, "fats": 10.9, "unit": "g", "category": "Protein"},
        {"name": "Lean Ground Beef", "calories": 250, "protein": 26, "carbohydrates": 0, "fats": 15, "unit": "g", "category": "Protein"},
        {"name": "Ribeye Steak", "calories": 291, "protein": 24, "carbohydrates": 0, "fats": 22, "unit": "g", "category": "Protein"},
        {"name": "Pork Tenderloin", "calories": 143, "protein": 26, "carbohydrates": 0, "fats": 3.5, "unit": "g", "category": "Protein"},
        {"name": "Bacon", "calories": 541, "protein": 37, "carbohydrates": 1.4, "fats": 42, "unit": "g", "category": "Protein"},
        {"name": "Salmon Fillet", "calories": 208, "protein": 20, "carbohydrates": 0, "fats": 13, "unit": "g", "category": "Protein"},
        {"name": "Cod Fillet", "calories": 82, "protein": 18, "carbohydrates": 0, "fats": 0.7, "unit": "g", "category": "Protein"},
        {"name": "Shrimp", "calories": 99, "protein": 24, "carbohydrates": 0.2, "fats": 0.3, "unit": "g", "category": "Protein"},
        {"name": "Tuna (Canned)", "calories": 116, "protein": 26, "carbohydrates": 0, "fats": 0.8, "unit": "g", "category": "Protein"},
        {"name": "Tofu (Firm)", "calories": 144, "protein": 15.7, "carbohydrates": 3.9, "fats": 8.1, "unit": "g", "category": "Protein"},
        {"name": "Tempeh", "calories": 192, "protein": 20, "carbohydrates": 7.6, "fats": 10.8, "unit": "g", "category": "Protein"},
        {"name": "Large Egg", "calories": 78, "protein": 6.3, "carbohydrates": 0.6, "fats": 5.3, "unit": "piece", "category": "Protein"},
        {"name": "Lentils (Cooked)", "calories": 116, "protein": 9, "carbohydrates": 20, "fats": 0.4, "unit": "g", "category": "Protein"},
        {"name": "Chickpeas (Canned)", "calories": 164, "protein": 8.9, "carbohydrates": 27, "fats": 2.6, "unit": "g", "category": "Protein"},
        {"name": "Black Beans (Canned)", "calories": 132, "protein": 8.9, "carbohydrates": 23.7, "fats": 0.5, "unit": "g", "category": "Protein"},
        {"name": "Pinto Beans (Cooked)", "calories": 143, "protein": 9, "carbohydrates": 26, "fats": 0.7, "unit": "g", "category": "Protein"},
        {"name": "Ground Turkey", "calories": 149, "protein": 24, "carbohydrates": 0, "fats": 5.9, "unit": "g", "category": "Protein"},
        {"name": "Lamb Chop", "calories": 294, "protein": 25, "carbohydrates": 0, "fats": 21, "unit": "g", "category": "Protein"},

        # --- VEGETABLES ---
        {"name": "Broccoli", "calories": 34, "protein": 2.8, "carbohydrates": 7, "fats": 0.4, "unit": "g", "category": "Vegetable"},
        {"name": "Spinach", "calories": 23, "protein": 2.9, "carbohydrates": 3.6, "fats": 0.4, "unit": "g", "category": "Vegetable"},
        {"name": "Carrot", "calories": 41, "protein": 0.9, "carbohydrates": 10, "fats": 0.2, "unit": "g", "category": "Vegetable"},
        {"name": "Bell Pepper (Red)", "calories": 31, "protein": 1, "carbohydrates": 6, "fats": 0.3, "unit": "g", "category": "Vegetable"},
        {"name": "Bell Pepper (Green)", "calories": 20, "protein": 0.9, "carbohydrates": 4.6, "fats": 0.2, "unit": "g", "category": "Vegetable"},
        {"name": "Zucchini", "calories": 17, "protein": 1.2, "carbohydrates": 3.1, "fats": 0.3, "unit": "g", "category": "Vegetable"},
        {"name": "Sweet Potato", "calories": 86, "protein": 1.6, "carbohydrates": 20, "fats": 0.1, "unit": "g", "category": "Vegetable"},
        {"name": "Potato (Russet)", "calories": 77, "protein": 2, "carbohydrates": 17, "fats": 0.1, "unit": "g", "category": "Vegetable"},
        {"name": "Kale", "calories": 49, "protein": 4.3, "carbohydrates": 8.8, "fats": 0.9, "unit": "g", "category": "Vegetable"},
        {"name": "Cucumber", "calories": 15, "protein": 0.7, "carbohydrates": 3.6, "fats": 0.1, "unit": "g", "category": "Vegetable"},
        {"name": "Tomato", "calories": 18, "protein": 0.9, "carbohydrates": 3.9, "fats": 0.2, "unit": "g", "category": "Vegetable"},
        {"name": "Onion (Yellow)", "calories": 40, "protein": 1.1, "carbohydrates": 9.3, "fats": 0.1, "unit": "g", "category": "Vegetable"},
        {"name": "Garlic", "calories": 149, "protein": 6.4, "carbohydrates": 33, "fats": 0.5, "unit": "g", "category": "Vegetable"},
        {"name": "Cauliflower", "calories": 25, "protein": 1.9, "carbohydrates": 5, "fats": 0.3, "unit": "g", "category": "Vegetable"},
        {"name": "Asparagus", "calories": 20, "protein": 2.2, "carbohydrates": 3.9, "fats": 0.1, "unit": "g", "category": "Vegetable"},
        {"name": "Green Beans", "calories": 31, "protein": 1.8, "carbohydrates": 7, "fats": 0.1, "unit": "g", "category": "Vegetable"},
        {"name": "Mushroom (Button)", "calories": 22, "protein": 3.1, "carbohydrates": 3.3, "fats": 0.3, "unit": "g", "category": "Vegetable"},
        {"name": "Celery", "calories": 16, "protein": 0.7, "carbohydrates": 3, "fats": 0.2, "unit": "g", "category": "Vegetable"},
        {"name": "Eggplant", "calories": 25, "protein": 1, "carbohydrates": 6, "fats": 0.2, "unit": "g", "category": "Vegetable"},
        {"name": "Brussels Sprouts", "calories": 43, "protein": 3.4, "carbohydrates": 9, "fats": 0.3, "unit": "g", "category": "Vegetable"},
        {"name": "Cabbage (Green)", "calories": 25, "protein": 1.3, "carbohydrates": 5.8, "fats": 0.1, "unit": "g", "category": "Vegetable"},

        # --- GRAINS, BREADS & FLOURS ---
        {"name": "Quinoa (Cooked)", "calories": 120, "protein": 4.4, "carbohydrates": 21.3, "fats": 1.9, "unit": "g", "category": "Grain"},
        {"name": "Brown Rice (Cooked)", "calories": 111, "protein": 2.6, "carbohydrates": 23, "fats": 0.9, "unit": "g", "category": "Grain"},
        {"name": "White Rice (Basmati)", "calories": 130, "protein": 2.7, "carbohydrates": 28, "fats": 0.3, "unit": "g", "category": "Grain"},
        {"name": "Oats (Rolled)", "calories": 389, "protein": 16.9, "carbohydrates": 66, "fats": 6.9, "unit": "g", "category": "Grain"},
        {"name": "Whole Wheat Bread", "calories": 247, "protein": 13, "carbohydrates": 41, "fats": 3.4, "unit": "g", "category": "Grain"},
        {"name": "White Bread", "calories": 265, "protein": 9, "carbohydrates": 49, "fats": 3.2, "unit": "g", "category": "Grain"},
        {"name": "Pasta (Wheat)", "calories": 131, "protein": 5, "carbohydrates": 25, "fats": 1.1, "unit": "g", "category": "Grain"},
        {"name": "Baguette", "calories": 289, "protein": 9, "carbohydrates": 57, "fats": 1.5, "unit": "g", "category": "Grain"},
        {"name": "Flour (All-Purpose)", "calories": 364, "protein": 10, "carbohydrates": 76, "fats": 1, "unit": "g", "category": "Baking"},
        {"name": "Flour (Whole Wheat)", "calories": 339, "protein": 13.2, "carbohydrates": 72, "fats": 1.9, "unit": "g", "category": "Baking"},
        {"name": "Almond Flour", "calories": 590, "protein": 21, "carbohydrates": 19, "fats": 53, "unit": "g", "category": "Baking"},
        {"name": "Cornmeal", "calories": 370, "protein": 7.9, "carbohydrates": 79, "fats": 3.6, "unit": "g", "category": "Baking"},
        {"name": "Couscous (Cooked)", "calories": 112, "protein": 3.8, "carbohydrates": 23, "fats": 0.2, "unit": "g", "category": "Grain"},

        # --- DAIRY & ALTERNATIVES ---
        {"name": "Milk (Whole)", "calories": 61, "protein": 3.2, "carbohydrates": 4.8, "fats": 3.3, "unit": "ml", "category": "Dairy"},
        {"name": "Milk (Skim)", "calories": 34, "protein": 3.4, "carbohydrates": 5, "fats": 0.1, "unit": "ml", "category": "Dairy"},
        {"name": "Almond Milk (Unsweetened)", "calories": 15, "protein": 0.6, "carbohydrates": 0.6, "fats": 1.2, "unit": "ml", "category": "Dairy"},
        {"name": "Soy Milk", "calories": 45, "protein": 3.3, "carbohydrates": 4, "fats": 1.8, "unit": "ml", "category": "Dairy"},
        {"name": "Butter", "calories": 717, "protein": 0.9, "carbohydrates": 0.1, "fats": 81, "unit": "g", "category": "Dairy"},
        {"name": "Cheddar Cheese", "calories": 403, "protein": 25, "carbohydrates": 1.3, "fats": 33, "unit": "g", "category": "Dairy"},
        {"name": "Mozzarella Cheese", "calories": 300, "protein": 22, "carbohydrates": 2.2, "fats": 22, "unit": "g", "category": "Dairy"},
        {"name": "Parmesan Cheese", "calories": 431, "protein": 38, "carbohydrates": 4.1, "fats": 29, "unit": "g", "category": "Dairy"},
        {"name": "Heavy Cream", "calories": 340, "protein": 2.8, "carbohydrates": 2.7, "fats": 36, "unit": "ml", "category": "Dairy"},
        {"name": "Greek Yogurt (Plain)", "calories": 59, "protein": 10, "carbohydrates": 3.6, "fats": 0.4, "unit": "g", "category": "Dairy"},

        # --- FRUITS ---
        {"name": "Avocado", "calories": 160, "protein": 2, "carbohydrates": 9, "fats": 15, "unit": "g", "category": "Fruit"},
        {"name": "Apple (Gala)", "calories": 52, "protein": 0.3, "carbohydrates": 14, "fats": 0.2, "unit": "g", "category": "Fruit"},
        {"name": "Banana", "calories": 89, "protein": 1.1, "carbohydrates": 23, "fats": 0.3, "unit": "g", "category": "Fruit"},
        {"name": "Blueberries", "calories": 57, "protein": 0.7, "carbohydrates": 14, "fats": 0.3, "unit": "g", "category": "Fruit"},
        {"name": "Strawberries", "calories": 32, "protein": 0.7, "carbohydrates": 7.7, "fats": 0.3, "unit": "g", "category": "Fruit"},
        {"name": "Lemon Juice", "calories": 22, "protein": 0.4, "carbohydrates": 7, "fats": 0.2, "unit": "ml", "category": "Fruit"},
        {"name": "Lime Juice", "calories": 25, "protein": 0.4, "carbohydrates": 8.4, "fats": 0.1, "unit": "ml", "category": "Fruit"},
        {"name": "Orange", "calories": 47, "protein": 0.9, "carbohydrates": 12, "fats": 0.1, "unit": "g", "category": "Fruit"},
        {"name": "Raspberries", "calories": 52, "protein": 1.2, "carbohydrates": 12, "fats": 0.7, "unit": "g", "category": "Fruit"},
        {"name": "Mango", "calories": 60, "protein": 0.8, "carbohydrates": 15, "fats": 0.4, "unit": "g", "category": "Fruit"},

        # --- OILS, CONDIMENTS & SWEETENERS ---
        {"name": "Olive Oil (Extra Virgin)", "calories": 884, "protein": 0, "carbohydrates": 0, "fats": 100, "unit": "ml", "category": "Oils"},
        {"name": "Coconut Oil", "calories": 862, "protein": 0, "carbohydrates": 0, "fats": 100, "unit": "ml", "category": "Oils"},
        {"name": "Canola Oil", "calories": 884, "protein": 0, "carbohydrates": 0, "fats": 100, "unit": "ml", "category": "Oils"},
        {"name": "Sesame Oil", "calories": 884, "protein": 0, "carbohydrates": 0, "fats": 100, "unit": "ml", "category": "Oils"},
        {"name": "Peanut Butter (Natural)", "calories": 588, "protein": 25, "carbohydrates": 20, "fats": 50, "unit": "g", "category": "Oils"},
        {"name": "Mayonnaise", "calories": 680, "protein": 1, "carbohydrates": 0.6, "fats": 75, "unit": "g", "category": "Condiment"},
        {"name": "Dijon Mustard", "calories": 66, "protein": 4.4, "carbohydrates": 5, "fats": 4.4, "unit": "g", "category": "Condiment"},
        {"name": "Ketchup", "calories": 101, "protein": 1.1, "carbohydrates": 26, "fats": 0.1, "unit": "g", "category": "Condiment"},
        {"name": "Honey", "calories": 304, "protein": 0.3, "carbohydrates": 82, "fats": 0, "unit": "g", "category": "Seasoning"},
        {"name": "Maple Syrup", "calories": 260, "protein": 0, "carbohydrates": 67, "fats": 0.1, "unit": "ml", "category": "Seasoning"},
        {"name": "Sugar (White)", "calories": 387, "protein": 0, "carbohydrates": 100, "fats": 0, "unit": "g", "category": "Baking"},
        {"name": "Brown Sugar", "calories": 380, "protein": 0, "carbohydrates": 98, "fats": 0, "unit": "g", "category": "Baking"},

        # --- NUTS & SEEDS ---
        {"name": "Almonds", "calories": 579, "protein": 21, "carbohydrates": 22, "fats": 50, "unit": "g", "category": "Nuts"},
        {"name": "Walnuts", "calories": 654, "protein": 15, "carbohydrates": 14, "fats": 65, "unit": "g", "category": "Nuts"},
        {"name": "Cashews", "calories": 553, "protein": 18, "carbohydrates": 30, "fats": 44, "unit": "g", "category": "Nuts"},
        {"name": "Chia Seeds", "calories": 486, "protein": 17, "carbohydrates": 42, "fats": 31, "unit": "g", "category": "Nuts"},
        {"name": "Pumpkin Seeds", "calories": 559, "protein": 30, "carbohydrates": 11, "fats": 49, "unit": "g", "category": "Nuts"},
        {"name": "Flax Seeds", "calories": 534, "protein": 18, "carbohydrates": 29, "fats": 42, "unit": "g", "category": "Nuts"},
        {"name": "Sunflower Seeds", "calories": 584, "protein": 21, "carbohydrates": 20, "fats": 51, "unit": "g", "category": "Nuts"},

        # --- SPICES & GLOBAL SEASONINGS ---
        {"name": "Salt (Sea)", "calories": 0, "protein": 0, "carbohydrates": 0, "fats": 0, "unit": "g", "category": "Seasoning"},
        {"name": "Black Pepper", "calories": 251, "protein": 10, "carbohydrates": 64, "fats": 3.3, "unit": "g", "category": "Seasoning"},
        {"name": "Cinnamon", "calories": 247, "protein": 4, "carbohydrates": 81, "fats": 1.2, "unit": "g", "category": "Seasoning"},
        {"name": "Cumin (Ground)", "calories": 375, "protein": 18, "carbohydrates": 44, "fats": 22, "unit": "g", "category": "Seasoning"},
        {"name": "Paprika (Smoked)", "calories": 282, "protein": 14, "carbohydrates": 54, "fats": 13, "unit": "g", "category": "Seasoning"},
        {"name": "Turmeric", "calories": 312, "protein": 9.7, "carbohydrates": 67, "fats": 3.3, "unit": "g", "category": "Seasoning"},
        {"name": "Ginger (Fresh)", "calories": 80, "protein": 1.8, "carbohydrates": 18, "fats": 0.8, "unit": "g", "category": "Seasoning"},
        {"name": "Soy Sauce (Low Sodium)", "calories": 53, "protein": 8, "carbohydrates": 4.9, "fats": 0.6, "unit": "ml", "category": "Seasoning"},
        {"name": "Miso Paste", "calories": 199, "protein": 12, "carbohydrates": 26, "fats": 6, "unit": "g", "category": "Seasoning"},
        {"name": "Tahini", "calories": 595, "protein": 17, "carbohydrates": 21, "fats": 54, "unit": "g", "category": "Seasoning"},
        {"name": "Gochujang", "calories": 176, "protein": 4, "carbohydrates": 38, "fats": 0.9, "unit": "g", "category": "Seasoning"},
        {"name": "Fish Sauce", "calories": 35, "protein": 5, "carbohydrates": 3.7, "fats": 0, "unit": "ml", "category": "Seasoning"},
        {"name": "Rice Vinegar", "calories": 18, "protein": 0, "carbohydrates": 0.2, "fats": 0, "unit": "ml", "category": "Seasoning"},
        {"name": "Apple Cider Vinegar", "calories": 21, "protein": 0, "carbohydrates": 0.9, "fats": 0, "unit": "ml", "category": "Seasoning"},
        {"name": "Dried Oregano", "calories": 265, "protein": 9, "carbohydrates": 69, "fats": 4, "unit": "g", "category": "Seasoning"},
        {"name": "Dried Basil", "calories": 233, "protein": 23, "carbohydrates": 48, "fats": 4, "unit": "g", "category": "Seasoning"},
        {"name": "Chili Powder", "calories": 282, "protein": 13, "carbohydrates": 50, "fats": 14, "unit": "g", "category": "Seasoning"},
        {"name": "Baking Powder", "calories": 53, "protein": 0, "carbohydrates": 28, "fats": 0, "unit": "g", "category": "Baking"},
        {"name": "Baking Soda", "calories": 0, "protein": 0, "carbohydrates": 0, "fats": 0, "unit": "g", "category": "Baking"},
        {"name": "Vanilla Extract", "calories": 288, "protein": 0.1, "carbohydrates": 13, "fats": 0.1, "unit": "ml", "category": "Baking"},
        # --- MORE FRUITS ---
        {"name": "Grapes (Red)", "calories": 69, "protein": 0.7, "carbohydrates": 18, "fats": 0.2, "unit": "g", "category": "Fruit"},
        {"name": "Grapes (Green)", "calories": 69, "protein": 0.7, "carbohydrates": 18, "fats": 0.2, "unit": "g", "category": "Fruit"},
        {"name": "Pineapple", "calories": 50, "protein": 0.5, "carbohydrates": 13, "fats": 0.1, "unit": "g", "category": "Fruit"},
        {"name": "Watermelon", "calories": 30, "protein": 0.6, "carbohydrates": 8, "fats": 0.2, "unit": "g", "category": "Fruit"},
        {"name": "Pear", "calories": 57, "protein": 0.4, "carbohydrates": 15, "fats": 0.1, "unit": "g", "category": "Fruit"},
        {"name": "Peach", "calories": 39, "protein": 0.9, "carbohydrates": 10, "fats": 0.3, "unit": "g", "category": "Fruit"},
        {"name": "Plum", "calories": 46, "protein": 0.7, "carbohydrates": 11, "fats": 0.3, "unit": "g", "category": "Fruit"},
        {"name": "Cherries", "calories": 50, "protein": 1, "carbohydrates": 12, "fats": 0.3, "unit": "g", "category": "Fruit"},
        {"name": "Kiwi", "calories": 61, "protein": 1.1, "carbohydrates": 15, "fats": 0.5, "unit": "g", "category": "Fruit"},

        # --- MORE VEGETABLES ---
        {"name": "Lettuce (Romaine)", "calories": 17, "protein": 1.2, "carbohydrates": 3.3, "fats": 0.3, "unit": "g", "category": "Vegetable"},
        {"name": "Lettuce (Iceberg)", "calories": 14, "protein": 0.9, "carbohydrates": 3, "fats": 0.1, "unit": "g", "category": "Vegetable"},
        {"name": "Arugula", "calories": 25, "protein": 2.6, "carbohydrates": 3.7, "fats": 0.7, "unit": "g", "category": "Vegetable"},
        {"name": "Radish", "calories": 16, "protein": 0.7, "carbohydrates": 3.4, "fats": 0.1, "unit": "g", "category": "Vegetable"},
        {"name": "Beets", "calories": 43, "protein": 1.6, "carbohydrates": 10, "fats": 0.2, "unit": "g", "category": "Vegetable"},
        {"name": "Corn (Sweet)", "calories": 86, "protein": 3.2, "carbohydrates": 19, "fats": 1.2, "unit": "g", "category": "Vegetable"},
        {"name": "Peas (Green)", "calories": 81, "protein": 5, "carbohydrates": 14, "fats": 0.4, "unit": "g", "category": "Vegetable"},
        {"name": "Leek", "calories": 61, "protein": 1.5, "carbohydrates": 14, "fats": 0.3, "unit": "g", "category": "Vegetable"},
        {"name": "Artichoke", "calories": 47, "protein": 3.3, "carbohydrates": 11, "fats": 0.2, "unit": "g", "category": "Vegetable"},

        # --- PANTRY STAPLES & BROTHS ---
        {"name": "Chicken Broth", "calories": 5, "protein": 1, "carbohydrates": 1, "fats": 0, "unit": "ml", "category": "Condiment"},
        {"name": "Beef Broth", "calories": 7, "protein": 1, "carbohydrates": 1, "fats": 0, "unit": "ml", "category": "Condiment"},
        {"name": "Vegetable Broth", "calories": 5, "protein": 0, "carbohydrates": 1, "fats": 0, "unit": "ml", "category": "Condiment"},
        {"name": "Canned Tomatoes (Diced)", "calories": 32, "protein": 1, "carbohydrates": 7, "fats": 0, "unit": "g", "category": "Vegetable"},
        {"name": "Tomato Paste", "calories": 82, "protein": 4, "carbohydrates": 19, "fats": 0, "unit": "g", "category": "Vegetable"},
        {"name": "Balsamic Vinegar", "calories": 88, "protein": 0, "carbohydrates": 17, "fats": 0, "unit": "ml", "category": "Seasoning"},
        {"name": "Red Wine Vinegar", "calories": 19, "protein": 0, "carbohydrates": 0, "fats": 0, "unit": "ml", "category": "Seasoning"},
        {"name": "White Wine Vinegar", "calories": 20, "protein": 0, "carbohydrates": 1, "fats": 0, "unit": "ml", "category": "Seasoning"},
        {"name": "Worcestershire Sauce", "calories": 78, "protein": 0, "carbohydrates": 20, "fats": 0, "unit": "ml", "category": "Seasoning"},
        {"name": "Hot Sauce (Sriracha)", "calories": 100, "protein": 2, "carbohydrates": 20, "fats": 2, "unit": "ml", "category": "Seasoning"},

        # --- MORE DAIRY ---
        {"name": "Sour Cream", "calories": 193, "protein": 2, "carbohydrates": 5, "fats": 19, "unit": "g", "category": "Dairy"},
        {"name": "Cottage Cheese", "calories": 98, "protein": 11, "carbohydrates": 3.4, "fats": 4.3, "unit": "g", "category": "Dairy"},
        {"name": "Cream Cheese", "calories": 342, "protein": 6, "carbohydrates": 4, "fats": 34, "unit": "g", "category": "Dairy"},
        {"name": "Feta Cheese", "calories": 264, "protein": 14, "carbohydrates": 4, "fats": 21, "unit": "g", "category": "Dairy"},
        {"name": "Goat Cheese", "calories": 364, "protein": 22, "carbohydrates": 0, "fats": 30, "unit": "g", "category": "Dairy"},

        # --- MORE SPICES ---
        {"name": "Chili Flakes", "calories": 282, "protein": 14, "carbohydrates": 50, "fats": 14, "unit": "g", "category": "Seasoning"},
        {"name": "Coriander (Ground)", "calories": 298, "protein": 12, "carbohydrates": 55, "fats": 18, "unit": "g", "category": "Seasoning"},
        {"name": "Cardamom", "calories": 311, "protein": 11, "carbohydrates": 68, "fats": 6.7, "unit": "g", "category": "Seasoning"},
        {"name": "Nutmeg", "calories": 525, "protein": 6, "carbohydrates": 49, "fats": 36, "unit": "g", "category": "Seasoning"},
        {"name": "Cloves", "calories": 274, "protein": 6, "carbohydrates": 66, "fats": 13, "unit": "g", "category": "Seasoning"},
    ]

    for ing in ingredients_data:
        try:
            await db.ingredient.create(data=ing)
        except Exception as e:
            print(f"Error seeding {ing['name']}: {e}")

    print(f"Successfully seeded {len(ingredients_data)} ingredients.")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
