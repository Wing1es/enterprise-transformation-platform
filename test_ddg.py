import sys
import os

# Add apps/api/src to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "apps/api/src")))

from llm.playwright_provider import playwright_llm

if __name__ == "__main__":
    print("Testing DDG Chat Provider...")
    try:
        response = playwright_llm.invoke("Hello, what is 2+2?")
        print(f"SUCCESS! DDG Chat says:\n{response}")
    except Exception as e:
        print(f"FAILED! Error: {e}")
