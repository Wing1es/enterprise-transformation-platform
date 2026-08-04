import json
import re

def clean_and_parse_json(text: str) -> dict | list:
    """Robustly extracts and parses JSON from arbitrary LLM response strings."""
    if not text:
        raise ValueError("Empty response string provided to JSON parser.")
        
    text = text.strip()
    
    # 1. Try direct json.loads
    try:
        return json.loads(text)
    except Exception:
        pass

    # 2. Extract code inside ```json ... ``` fences
    fence_matches = re.findall(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    for fm in fence_matches:
        try:
            return json.loads(fm.strip())
        except Exception:
            pass

    # 3. Brace balancing for top-level JSON Object `{ ... }`
    start_obj = text.find('{')
    if start_obj != -1:
        depth = 0
        in_string = False
        escape = False
        for i in range(start_obj, len(text)):
            char = text[i]
            if escape:
                escape = False
                continue
            if char == '\\':
                escape = True
                continue
            if char == '"':
                in_string = not in_string
                continue
            if not in_string:
                if char == '{':
                    depth += 1
                elif char == '}':
                    depth -= 1
                    if depth == 0:
                        candidate = text[start_obj:i+1]
                        try:
                            return json.loads(candidate)
                        except Exception:
                            break

    # 4. Bracket balancing for top-level JSON Array `[ ... ]`
    start_arr = text.find('[')
    if start_arr != -1:
        depth = 0
        in_string = False
        escape = False
        for i in range(start_arr, len(text)):
            char = text[i]
            if escape:
                escape = False
                continue
            if char == '\\':
                escape = True
                continue
            if char == '"':
                in_string = not in_string
                continue
            if not in_string:
                if char == '[':
                    depth += 1
                elif char == ']':
                    depth -= 1
                    if depth == 0:
                        candidate = text[start_arr:i+1]
                        try:
                            return json.loads(candidate)
                        except Exception:
                            break

    # 5. Last resort fallback
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group(0))

    return json.loads(text)
