import re
import glob

files = glob.glob('public/uploads/docs/dep12_*.html')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    def replace_a(match):
        text = match.group(2)
        text = re.sub(r'\s+', ' ', text).strip()
        return f'<a href="{match.group(1)}">{text}</a>'

    # Fix the newlines inside <a> tags in the aside block
    aside_match = re.search(r'(<h2>📚 الفهرس</h2>.*?</aside>)', html, re.DOTALL)
    if aside_match:
        aside_text = aside_match.group(1)
        new_aside = re.sub(r'<a href="([^"]+)">(.*?)</a>', replace_a, aside_text, flags=re.DOTALL)
        html = html.replace(aside_text, new_aside)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

print("Cleaned up newlines!")
