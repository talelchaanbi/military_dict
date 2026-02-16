from bs4 import BeautifulSoup
import json
import os
import re

# Files to process
FILES = [
    "dep13_section1.html",
    "dep13_section2.html",
    "dep13_section3.html",
    "dep13_section4.html",
    "dep13_section5.html"
]

BASE_DIR = "/home/mdn/Desktop/military_dict/web/public/uploads/docs"
OUTPUT_FILE = "/home/mdn/Desktop/military_dict/web/prisma/dep13_data.json"

def clean_text(text):
    if not text: return ""
    return re.sub(r'\s+', ' ', text).strip()

def process_file(filename, section_data):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Determine Section Title
    title = f"Section {section_data['section']['number']}"
    h1 = soup.find('h1')
    if h1: title = clean_text(h1.get_text())
    
    section_data['section']['title'] = title
    
    # Process Tables
    terms = []
    tables = soup.find_all("table")
    print(f"Processing {filename}: Found {len(tables)} tables.")

    for table in tables:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            if not cells: continue
            
            # Skip header rows (heuristic: usually contain 'الرمز' or 'الوصف')
            row_text = row.get_text()
            if "الرمز" in row_text and "معنى" in row_text:
                continue
            if "لأغراض عامة" in row_text and len(cells) < 3: # Subheaders
                continue

            # Extract Data
            image_url = None
            texts = []
            
            # Start from index 1 to skip # column, or check content
            # Some # columns are empty
            
            # Better: analyze logic
            process_cells = cells
            if len(cells) > 0:
                first_text = clean_text(cells[0].get_text())
                # If first column is digits or empty or '#', skip it
                if first_text.isdigit() or first_text == '#' or first_text == '':
                    process_cells = cells[1:]
                else:
                    process_cells = cells # First column might be content if no number col

            for cell in process_cells:
                img = cell.find("img")
                if img and img.get("src"):
                    # Check for extracted_images
                    src = img.get("src")
                    if "assets/" in src:
                        # Fix it
                        filename_img = os.path.basename(src)
                        # We assume extracted images are in public/extracted_images/
                        # But here we just need the URL path relative to public
                        # User said "extracted_images" folder is used.
                        # Wait, we need to know where the file ACTUALLY is.
                        # Assuming they are in 'extracted_images/' folder.
                        src = f"/uploads/docs/extracted_images/{filename_img}"
                    elif "extracted_images/" in src:
                        # Fix it to absolute path
                        filename_img = os.path.basename(src)
                        src = f"/uploads/docs/extracted_images/{filename_img}"
                    
                    image_url = src
                else:
                    txt = clean_text(cell.get_text())
                    if txt:
                        texts.append(txt)
            
            if image_url or texts:
                term_obj = {
                    "term": texts[0] if texts else ("رمز" if image_url else ""),
                    "definition": " ".join(texts[1:]) if len(texts) > 1 else "",
                    "imageUrl": image_url
                }
                
                # Filter noise
                if term_obj['term'] == "رمز" and not image_url:
                    continue # Empty row
                    
                terms.append(term_obj)

    section_data['terms'] = terms
    print(f"  Extracted {len(terms)} terms.")

final_data = []

for idx, filename in enumerate(FILES):
    sec_num = idx + 1
    sec_data = {"section": {"number": sec_num}, "terms": []}
    process_file(filename, sec_data)
    final_data.append(sec_data)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {OUTPUT_FILE}")
