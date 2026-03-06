import re
import glob

# Read the reference CSS from dep12_section1.html
with open('public/uploads/docs/dep12_section1.html', 'r', encoding='utf-8') as f:
    ref_html = f.read()

style_match = re.search(r'<style>(.*?)</style>', ref_html, re.DOTALL)
if style_match:
    reference_style = style_match.group(1)
else:
    print("Error: Could not find <style> in section1")
    exit(1)

# Files to update
files = glob.glob('public/uploads/docs/dep12_*.html')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Replace style
    new_html = re.sub(r'<style>.*?</style>', f'<style>{reference_style}</style>', html, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print(f"Synced styles for {filepath}")

