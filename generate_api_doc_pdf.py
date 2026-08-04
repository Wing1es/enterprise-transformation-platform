import os
from playwright.sync_api import sync_playwright

md_path = "/Users/shekar/.gemini/antigravity-ide/brain/6674fa63-994c-4954-ac56-711ed1726b72/api_documentation.md"
pdf_artifact_path = "/Users/shekar/.gemini/antigravity-ide/brain/6674fa63-994c-4954-ac56-711ed1726b72/api_documentation.pdf"
pdf_workspace_path = "/Users/shekar/Documents/self/jobs/modus3/api_documentation.pdf"

with open(md_path, "r", encoding="utf-8") as f:
    md_content = f.read()

html_content = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    body {{
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        color: #1e293b;
        max-width: 820px;
        margin: 0 auto;
        padding: 40px 20px;
        background: #ffffff;
    }}
    h1 {{
        font-size: 26px;
        font-weight: 700;
        color: #0f172a;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 12px;
        margin-top: 0;
    }}
    h2 {{
        font-size: 19px;
        font-weight: 600;
        color: #1e293b;
        margin-top: 32px;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 6px;
    }}
    h3 {{
        font-size: 15px;
        font-weight: 600;
        color: #334155;
        margin-top: 24px;
    }}
    p, li {{
        font-size: 13.5px;
        color: #334155;
    }}
    code {{
        font-family: 'JetBrains Mono', monospace;
        background-color: #f1f5f9;
        color: #0f172a;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12.5px;
    }}
    pre {{
        background-color: #0f172a;
        color: #f8fafc;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 12px;
    }}
    pre code {{
        background-color: transparent;
        color: inherit;
        padding: 0;
    }}
    table {{
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 13px;
    }}
    th, td {{
        border: 1px solid #e2e8f0;
        padding: 9px 12px;
        text-align: left;
    }}
    th {{
        background-color: #f8fafc;
        font-weight: 600;
        color: #0f172a;
    }}
    tr:nth-child(even) {{
        background-color: #f8fafc;
    }}
    ol, ul {{
        padding-left: 24px;
    }}
    hr {{
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 32px 0;
    }}
</style>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
<div id="content"></div>

<script>
    const rawMarkdown = {repr(md_content)};
    document.getElementById('content').innerHTML = marked.parse(rawMarkdown);
</script>
</body>
</html>
"""

temp_html_path = "/tmp/api_doc_temp.html"
with open(temp_html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Generating API Documentation PDF via Playwright...")
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(f"file://{temp_html_path}", wait_until="networkidle")
    
    page.pdf(
        path=pdf_artifact_path,
        format="A4",
        margin={"top": "18mm", "bottom": "18mm", "left": "15mm", "right": "15mm"},
        print_background=True
    )
    page.pdf(
        path=pdf_workspace_path,
        format="A4",
        margin={"top": "18mm", "bottom": "18mm", "left": "15mm", "right": "15mm"},
        print_background=True
    )
    browser.close()

print("API PDF Successfully generated!")
