import os
import time
import logging
from dotenv import load_dotenv
from litellm import completion
from llm.playwright_provider import playwright_llm

# Load .env file
load_dotenv()
logger = logging.getLogger(__name__)


class LLM:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "playwright").lower()
        self.model = os.getenv("LLM_MODEL", "playwright")
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")

    def invoke(self, prompt: str, max_retries: int = 2) -> str:
        # Always use playwright provider if specified or if no API key
        if self.provider == "playwright" or not self.groq_api_key:
            logger.info("Invoking Playwright Headless Web LLM Provider (Zero API Key)...")
            return playwright_llm.invoke(prompt)

        kwargs = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "response_format": {"type": "json_object"},
        }

        if "groq" in self.model.lower():
            if self.groq_api_key:
                kwargs["api_key"] = self.groq_api_key
        elif "ollama" in self.model.lower():
            kwargs["api_base"] = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")

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
                    logger.warning(f"API Provider failed ({e}). Falling back to Playwright Headless Web Provider...")
                    return playwright_llm.invoke(prompt)

        return playwright_llm.invoke(prompt)


llm = LLM()