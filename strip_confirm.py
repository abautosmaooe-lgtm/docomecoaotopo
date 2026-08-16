import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Replace `if (confirm("...")) {` with `{`
    # We will use a regex that handles whitespace and optional `window.`
    new_content = re.sub(r'if\s*\(\s*(?:window\.)?confirm\s*\([^)]+\)\s*\)\s*\{', '{', content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
