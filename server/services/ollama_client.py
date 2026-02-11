"""
Client for interacting with local Ollama LLM API.
Provides async API calls with error handling and fallback.
"""

import httpx
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class OllamaClient:
    """Client for interacting with local Ollama LLM API"""

    def __init__(self):
        self.base_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "mistral")
        self.fallback_mode = os.getenv("LLM_FALLBACK_MODE", "mock")
        self.timeout = 120.0  # 2 minutes for recipe generation

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> Optional[str]:
        """
        Generate text using Ollama API

        Args:
            prompt: User prompt
            system_prompt: System instructions
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate

        Returns:
            Generated text or None if Ollama unavailable
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Ollama generate API format
                full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
                
                payload = {
                    "model": self.model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens
                    }
                }

                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )

                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "")
                else:
                    print(f"Ollama API error: {response.status_code}")
                    print(f"Response: {response.text}")
                    return None

        except httpx.ConnectError:
            print(f"Could not connect to Ollama at {self.base_url}")
            return None
        except httpx.TimeoutException:
            print(f"Ollama request timed out after {self.timeout}s")
            return None
        except Exception as e:
            print(f"Ollama generation error: {e}")
            return None

    async def is_available(self) -> bool:
        """
        Check if Ollama is running

        Returns:
            True if Ollama is accessible, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except:
            return False
