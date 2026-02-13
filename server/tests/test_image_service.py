"""Tests for the ImageService URL generation."""

from services.image_service import ImageService


def test_generate_recipe_image_url():
    """Test recipe image URL generation."""
    url = ImageService.generate_recipe_image_url("Chicken Salad", "A healthy dish")
    assert "pollinations.ai" in url
    assert "width=800" in url
    assert "height=600" in url
    assert "nologo=true" in url


def test_generate_step_image_url():
    """Test step image URL generation."""
    url = ImageService.generate_step_image_url("Grill the chicken", "Chicken Salad", 1)
    assert "pollinations.ai" in url
    assert "width=600" in url
    assert "height=400" in url


def test_generate_all_image_urls():
    """Test batch URL generation."""
    steps = [
        {"order": 1, "instruction": "Prep ingredients"},
        {"order": 2, "instruction": "Cook everything"}
    ]
    result = ImageService.generate_all_image_urls("Test Recipe", "A test", steps)

    assert "recipe_image_url" in result
    assert "step_image_urls" in result
    assert len(result["step_image_urls"]) == 2


def test_url_is_deterministic():
    """Same inputs produce the same URL."""
    url1 = ImageService.generate_recipe_image_url("Pasta", "Italian")
    url2 = ImageService.generate_recipe_image_url("Pasta", "Italian")
    assert url1 == url2


def test_handles_empty_description():
    """Works when description is empty."""
    url = ImageService.generate_recipe_image_url("Salad", "")
    assert "pollinations.ai" in url


def test_truncates_long_instructions():
    """Long instructions don't create excessively long URLs."""
    long_instruction = "A" * 500
    url = ImageService.generate_step_image_url(long_instruction, "Recipe", 1)
    assert len(url) < 2000
