"""Persistent Playwright Browser LLM Provider.
Supports real Web LLM interfaces (ChatGPT / Gemini / DuckDuckGo Chat) headlessly using persistent session state.
"""
import os
import re
import json
import time
import logging
from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)

SESSION_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/browser_session"))


class PersistentPlaywrightLLMProvider:
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.target_url = os.getenv("WEB_LLM_URL", "https://duckduckgo.com/chat")
        os.makedirs(SESSION_DIR, exist_ok=True)

    def invoke(self, prompt: str, timeout_ms: int = 60000) -> str:
        """Executes prompt against persistent browser session on ChatGPT/Gemini/DDG."""
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=SESSION_DIR,
                headless=self.headless,
                args=["--disable-blink-features=AutomationControlled"],
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 800},
            )
            page = context.pages[0] if context.pages else context.new_page()

            try:
                # 1. Navigate to target URL
                page.goto(self.target_url, timeout=timeout_ms)
                time.sleep(2)

                # 2. Handle ChatGPT Web UI vs DDG Chat vs Gemini
                if "chatgpt" in self.target_url.lower():
                    self._interact_chatgpt(page, prompt)
                else:
                    self._interact_ddg_chat(page, prompt)

                # 3. Poll for response completion
                last_text = ""
                stable_count = 0
                for _ in range(40):
                    # Multi-selector response locator
                    response_elems = (
                        page.query_selector_all("[data-message-author-role='assistant']") or
                        page.query_selector_all(".markdown") or
                        page.query_selector_all("[data-testid='chat-message']") or
                        page.query_selector_all("div.agent-turn") or
                        page.query_selector_all("div[class*='message']") or
                        page.query_selector_all("div[class*='reply']") or
                        page.query_selector_all("article")
                    )
                    
                    if response_elems:
                        current_text = response_elems[-1].inner_text()
                    else:
                        # Fallback to entire page body text
                        current_text = page.inner_text("body")

                    if current_text and current_text == last_text and len(current_text.strip()) > 30:
                        stable_count += 1
                        if stable_count >= 3:
                            break
                    else:
                        stable_count = 0
                        last_text = current_text
                    time.sleep(1.5)

                context.close()

                if not last_text:
                    raise RuntimeError("No output generated from Web LLM page.")

                # Extract JSON from real output
                match = re.search(r"\{.*\}", last_text, re.DOTALL)
                if match:
                    return match.group(0)
                return last_text

            except Exception as e:
                context.close()
                logger.error(f"Playwright Browser Execution Error: {e}")
                raise RuntimeError(f"Real Playwright Web LLM generation failed: {str(e)}")

    def _interact_chatgpt(self, page, prompt: str):
        # Locate ChatGPT input box (#prompt-textarea or contenteditable or textarea)
        input_elem = (
            page.query_selector("#prompt-textarea") or
            page.query_selector("div[contenteditable='true']") or
            page.query_selector("textarea")
        )
        if not input_elem:
            raise RuntimeError("ChatGPT prompt input box not found. Run 'python3 scripts/init_browser_session.py' to complete initial login.")

        input_elem.focus()
        input_elem.fill(prompt)
        time.sleep(0.5)

        # Click send or press Enter
        send_btn = page.query_selector("button[data-testid='send-button']")
        if send_btn and send_btn.is_enabled():
            send_btn.click()
        else:
            page.keyboard.press("Enter")

    def _interact_ddg_chat(self, page, prompt: str):
        time.sleep(1)
        for label in ["Get Started", "Start Chatting", "Continue", "Next"]:
            btn = page.query_selector(f"button:has-text('{label}')")
            if btn and btn.is_visible():
                btn.click()
                time.sleep(1)

        for label in ["Agree", "I Agree", "Accept"]:
            btn = page.query_selector(f"button:has-text('{label}')")
            if btn and btn.is_visible():
                btn.click()
                time.sleep(1)

        textarea = page.wait_for_selector("textarea, div[contenteditable='true']", timeout=15000)
        textarea.focus()
        textarea.fill(prompt)
        time.sleep(0.5)

        submit_btn = page.query_selector("button[type='submit'], button[aria-label*='Send']")
        if submit_btn and submit_btn.is_enabled():
            submit_btn.click()
        else:
            page.keyboard.press("Enter")


playwright_llm = PersistentPlaywrightLLMProvider(headless=True)
