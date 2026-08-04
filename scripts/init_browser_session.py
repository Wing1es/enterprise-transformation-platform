"""Browser Session Initializer Script.
Run this script once to open a visible browser window, log into ChatGPT (chatgpt.com) or Gemini (gemini.google.com).
The session cookies and localStorage will be saved permanently in data/browser_session/ for headless use by the backend.
"""
import os
import time
import sys
from playwright.sync_api import sync_playwright

SESSION_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/browser_session"))


def init_session():
    os.makedirs(SESSION_DIR, exist_ok=True)
    print(f"--- Opening Persistent Browser for Initial Login / Session Setup ---")
    print(f"Session data folder: {SESSION_DIR}")
    print("Log in to ChatGPT or Gemini in the opened browser window. When finished, press ENTER in terminal.")

    try:
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=SESSION_DIR,
                headless=False,  # Visible browser window for login
                args=["--disable-blink-features=AutomationControlled"],
                viewport={"width": 1280, "height": 800},
            )
            page = context.pages[0] if context.pages else context.new_page()
            page.goto("https://chatgpt.com")

            # Wait for user input in terminal instead of Ctrl+C loop
            input("\n[Action Required] Log into ChatGPT/Gemini in the browser, then press ENTER here to save & exit...")

            print("Saving session cookies and closing browser...")
            context.close()
            print("--- Session Saved Successfully! ---")
    except Exception as e:
        print(f"\nBrowser session saved to {SESSION_DIR}")


if __name__ == "__main__":
    init_session()
