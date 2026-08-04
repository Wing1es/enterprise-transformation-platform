import os
import glob
import re

directory = "/Users/shekar/Documents/self/jobs/modus3/apps/web/src"
files = glob.glob(os.path.join(directory, "**", "*.tsx"), recursive=True)
files.extend(glob.glob(os.path.join(directory, "**", "*.ts"), recursive=True))

config_content = """export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
"""
with open(os.path.join(directory, "config.ts"), "w") as f:
    f.write(config_content)

for file_path in files:
    if file_path.endswith("config.ts"):
        continue

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    if "http://localhost:8000" in content:
        # Add import for API_URL at the top
        
        # Calculate relative path to config.ts
        rel_dir = os.path.relpath(directory, os.path.dirname(file_path))
        if rel_dir == ".":
            import_path = "./config"
        else:
            import_path = f"{rel_dir}/config"
            
        import_stmt = f"import {{ API_URL }} from '{import_path}';\n"
        
        lines = content.split('\n')
        # Insert after the last import
        last_import = 0
        for i, line in enumerate(lines):
            if line.startswith("import "):
                last_import = i
                
        lines.insert(last_import + 1, import_stmt)
        content = "\n".join(lines)
        
        # Replace occurrences
        # 1. 'http://localhost:8000...' -> `${API_URL}...`
        content = re.sub(r"'http://localhost:8000([^']*)'", r"`${API_URL}\1`", content)
        
        # 2. `http://localhost:8000...` -> `${API_URL}...`
        content = re.sub(r"`http://localhost:8000([^`]*)`", r"`${API_URL}\1`", content)
        
        # 3. "http://localhost:8000..." -> `${API_URL}...`
        content = re.sub(r'"http://localhost:8000([^"]*)"', r"`${API_URL}\1`", content)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file_path}")

