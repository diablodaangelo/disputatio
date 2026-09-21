import json
import re
import httpx
import asyncio
from typing import Type, TypeVar, Optional
from pydantic import BaseModel, ValidationError

from app.core.config import settings
from app.core.exceptions import GeminiApiException, PydanticValidationException

T = TypeVar("T", bound=BaseModel)

class GeminiClient:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.primary_model = settings.GEMINI_MODEL
        self.fallback_model = settings.FALLBACK_MODEL

    def _clean_json_markdown(self, text: str) -> str:
        """Strip markdown code fences or extract JSON substring if returned by model."""
        text = text.strip()
        code_block = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text, re.DOTALL)
        if code_block:
            return code_block.group(1).strip()
        first_brace = text.find('{')
        last_brace = text.rfind('}')
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            return text[first_brace:last_brace + 1].strip()
        return text

    async def generate_structured(
        self,
        system_prompt: str,
        user_content: str,
        response_schema_class: Type[T],
        custom_api_key: Optional[str] = None,
        max_retries: int = 3
    ) -> T:
        active_key = custom_api_key or self.api_key
        if not active_key:
            raise GeminiApiException("GEMINI_API_KEY is not configured in environment variables and no custom API key was provided.")

        models_to_try = [self.primary_model, self.fallback_model]
        
        last_error = None
        for model in models_to_try:
            url = f"{self.base_url}/models/{model}:generateContent?key={active_key}"
            
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"{system_prompt}\n\nDOCUMENT CONTENT:\n{user_content}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "topP": 0.8,
                    "responseMimeType": "application/json"
                }
            }

            for attempt in range(max_retries):
                try:
                    async with httpx.AsyncClient(timeout=90.0) as client:
                        response = await client.post(url, json=payload)
                        
                        if response.status_code == 429:
                            # Rate limit hit, backoff and retry
                            wait_time = (attempt + 1) * 3
                            await asyncio.sleep(wait_time)
                            continue

                        if response.status_code != 200:
                            # Try next attempt or switch model
                            last_error = f"Gemini HTTP {response.status_code}: {response.text}"
                            break

                        data = response.json()
                        candidates = data.get("candidates", [])
                        if not candidates:
                            last_error = "Gemini returned no candidates."
                            break

                        raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        cleaned_json_str = self._clean_json_markdown(raw_text)
                        
                        try:
                            parsed_dict = json.loads(cleaned_json_str)
                            # Pydantic validation
                            validated = response_schema_class.model_validate(parsed_dict)
                            return validated
                        except (json.JSONDecodeError, ValidationError) as ve:
                            # JSON structure error, attempt one repair prompt
                            repair_prompt = (
                                f"The following JSON failed validation for schema {response_schema_class.__name__}.\n"
                                f"Error: {str(ve)}\n"
                                f"Invalid JSON:\n{cleaned_json_str}\n"
                                f"Fix and return only the corrected valid JSON adhering strictly to the schema."
                            )
                            repair_payload = {
                                "contents": [{"parts": [{"text": repair_prompt}]}],
                                "generationConfig": {"responseMimeType": "application/json"}
                            }
                            repair_resp = await client.post(url, json=repair_payload)
                            if repair_resp.status_code == 200:
                                rep_text = repair_resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                                rep_dict = json.loads(self._clean_json_markdown(rep_text))
                                return response_schema_class.model_validate(rep_dict)
                            else:
                                raise PydanticValidationException(f"Schema validation failed: {str(ve)}")

                except httpx.RequestError as req_err:
                    last_error = f"Network error connecting to Gemini API: {str(req_err)}"
                    await asyncio.sleep(2)
                    continue
                except PydanticValidationException:
                    raise
                except Exception as e:
                    last_error = f"Unexpected Gemini error: {str(e)}"
                    break

        raise GeminiApiException(f"Failed to generate structured AI response after retries: {last_error}")

gemini_client = GeminiClient()
