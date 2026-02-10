import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()

    # Count total ingredients
    count = await db.ingredient.count()
    print(f"Total ingredients in database: {count}")

    # Show sample ingredients
    print("\nSample ingredients:")
    ingredients = await db.ingredient.find_many(take=5)
    for ing in ingredients:
        print(f"  - {ing.name}: {ing.calories} cal, {ing.protein}g protein ({ing.category})")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
