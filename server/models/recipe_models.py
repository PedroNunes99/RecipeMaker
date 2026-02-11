"""
Pydantic models for recipe request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class RecipeIngredientCreate(BaseModel):
    """Model for creating a recipe ingredient relationship."""
    ingredientId: str
    quantity: float = Field(gt=0, description="Quantity must be greater than 0")
    unit: str = Field(min_length=1, description="Unit of measurement")


class RecipeStepCreate(BaseModel):
    """Model for creating a recipe step."""
    order: int = Field(ge=1, description="Step order must be >= 1")
    instruction: str = Field(min_length=1, description="Step instruction cannot be empty")
    notes: Optional[str] = Field(None, max_length=500, description="Optional tips or notes for this step")


class RecipeCreateRequest(BaseModel):
    """Model for creating a new recipe."""
    title: str = Field(min_length=1, max_length=200, description="Recipe title")
    description: Optional[str] = Field(None, description="Recipe description")
    servings: int = Field(default=1, ge=1, description="Number of servings")
    ingredients: List[RecipeIngredientCreate] = Field(description="List of ingredients")
    steps: List[RecipeStepCreate] = Field(description="List of preparation steps")


class RecipeUpdateRequest(BaseModel):
    """Model for updating an existing recipe."""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Recipe title")
    description: Optional[str] = Field(None, description="Recipe description")
    servings: Optional[int] = Field(None, ge=1, description="Number of servings")
    ingredients: Optional[List[RecipeIngredientCreate]] = Field(None, description="List of ingredients")
    steps: Optional[List[RecipeStepCreate]] = Field(None, description="List of preparation steps")
