"""
Service for generating AI image URLs using Pollinations.ai.
URLs are deterministic: same prompt always produces the same image.
Free, no API key required.
"""

from urllib.parse import quote
from typing import List, Dict


class ImageService:
    """Generates Pollinations.ai image URLs for recipes and steps."""

    BASE_URL = "https://image.pollinations.ai/prompt"
    STYLE_SUFFIX = "food photography, professional studio lighting, warm tones, clean presentation, 4k"

    RECIPE_WIDTH = 800
    RECIPE_HEIGHT = 600
    STEP_WIDTH = 600
    STEP_HEIGHT = 400

    @staticmethod
    def generate_recipe_image_url(title: str, description: str = "") -> str:
        """Generate a hero image URL for a recipe."""
        prompt_parts = [f"A beautiful dish of {title}"]
        if description:
            prompt_parts.append(description[:100])
        prompt_parts.append(ImageService.STYLE_SUFFIX)

        full_prompt = ", ".join(prompt_parts)
        encoded = quote(full_prompt)

        return (
            f"{ImageService.BASE_URL}/{encoded}"
            f"?width={ImageService.RECIPE_WIDTH}"
            f"&height={ImageService.RECIPE_HEIGHT}"
            f"&nologo=true"
            f"&enhance=true"
        )

    @staticmethod
    def generate_step_image_url(instruction: str, recipe_title: str, step_order: int) -> str:
        """Generate an image URL for a recipe step."""
        truncated = instruction[:150]

        prompt = (
            f"Step {step_order} of cooking {recipe_title}: "
            f"{truncated}, "
            f"{ImageService.STYLE_SUFFIX}"
        )
        encoded = quote(prompt)

        return (
            f"{ImageService.BASE_URL}/{encoded}"
            f"?width={ImageService.STEP_WIDTH}"
            f"&height={ImageService.STEP_HEIGHT}"
            f"&nologo=true"
            f"&enhance=true"
        )

    @staticmethod
    def generate_all_image_urls(
        title: str,
        description: str,
        steps: List[Dict]
    ) -> Dict:
        """Generate all image URLs for a complete recipe."""
        recipe_url = ImageService.generate_recipe_image_url(title, description)

        step_urls = []
        for step in steps:
            url = ImageService.generate_step_image_url(
                instruction=step.get("instruction", ""),
                recipe_title=title,
                step_order=step.get("order", 0)
            )
            step_urls.append(url)

        return {
            "recipe_image_url": recipe_url,
            "step_image_urls": step_urls
        }
