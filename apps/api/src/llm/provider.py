import os
import time
import logging
from dotenv import load_dotenv
from litellm import completion

# Load .env file
load_dotenv()
logger = logging.getLogger(__name__)


class LLM:
    def __init__(self):
        self.model = os.getenv("LLM_MODEL", "gpt-4o")

    def invoke(self, prompt: str, api_key: str = "", max_retries: int = 2, json_mode: bool = True) -> str:
        if not api_key:
            logger.warning("No API Key provided. Set X-LLM-API-Key header in the frontend.")
            return '{"error": "No API Key provided"}'

        actual_model = self.model
        if api_key.startswith("gsk_"):
            actual_model = "groq/llama-3.3-70b-versatile"

        # Groq (and OpenAI) require the word 'json' in the prompt when using response_format={"type": "json_object"}
        final_prompt = prompt
        if json_mode and "json" not in final_prompt.lower():
            final_prompt += "\nEnsure your output is in valid JSON format."

        kwargs = {
            "model": actual_model,
            "messages": [
                {
                    "role": "user",
                    "content": final_prompt,
                }
            ]
        }

        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        if "groq" in actual_model.lower() or "llama" in actual_model.lower():
            kwargs["api_key"] = api_key
        elif "ollama" in actual_model.lower():
            kwargs["api_base"] = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")
        else:
            kwargs["api_key"] = api_key

        for attempt in range(max_retries):
            try:
                response = completion(**kwargs)
                return response.choices[0].message.content
            except Exception as e:
                err_msg = str(e)
                if ("rate_limit" in err_msg.lower() or "429" in err_msg) and attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2.0
                    logger.warning(f"API Rate Limit encountered. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    logger.error(f"API Provider failed: {err_msg}")
                    return f'{{"error": "LLM Invocation Failed: {err_msg}"}}'
        
        return '{"error": "Max retries exceeded"}'


llm = LLM()