import re
import glob

files = glob.glob('public/uploads/docs/dep12_*.html')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find all summaries to rebuild the sidebar
    # We look for <div class="card" id="..."> ... <summary>emoji Title</summary>
    cards = re.findall(r'<div class="card" id="([^"]+)">.*?<summary>(.*?)</summary>', html, re.DOTALL)
    
    if not cards:
        continue
        
    print(f"Rebuilding sidebar for {filepath} with {len(cards)} items")
    
    new_links = "    <h2>📚 الفهرس</h2>\n"
    for card_id, summary_text in cards:
        # Clean up the emoji and extra spaces
        # e.g. "📌 1 ـ رموز الصنوف والأسلحة والخدمات" -> "1. رموز الصنوف والأسلحة والخدمات"
        clean_text = summary_text.strip()
        # Remove emojis (any non-word, non-number, non-arabic, non-space character at the start)
        clean_text = re.sub(r'^[^\w\d\sـ]+', '', clean_text).strip()
        # Replace ' ـ ' with '. ' for standard sidebar look
        clean_text = clean_text.replace(' ـ ', '. ')
        
        new_links += f'    <a href="#{card_id}">{clean_text}</a>\n'
        
    # Replace the old sidebar links block
    # Everything from <h2>📚 الفهرس</h2> down to </aside>
    html = re.sub(r'<h2>📚 الفهرس</h2>.*?</aside>', new_links + '  </aside>', html, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
        
print("Sidebars fixed!")
