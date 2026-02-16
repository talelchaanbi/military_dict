from bs4 import BeautifulSoup
import os

# Files to clean up and ensure are collapsed
FILES = [
    "dep12_section1.html", # Checking just in case
    "dep12_section2.html",
    "dep12_section3.html"
]

BASE_DIR = "/home/mdn/Desktop/military_dict/web/public/uploads/docs"

def clean_and_collapse(filename):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    print(f"Processing {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    sections = soup.find_all("section")
    
    # 1. Remove nested sections logic
    # We iterate and check if a section contains *another* section.
    # If so, we remove the inner one if it looks like a duplicate (same ID usually).
    
    for section in sections:
        # Check for immediate child section or one deep
        # Usually it's inside content-block
        content_block = section.find(class_="content-block")
        if content_block:
            inner_section = content_block.find("section")
            if inner_section:
                # print(f"  Found nested section in {section.get('id')}. Removing it.")
                inner_section.decompose()

    # 2. Add 'section-collapsed' class to ALL sections
    sections = soup.find_all("section") # Re-fetch after modification
    count_collapsed = 0
    for section in sections:
        classes = section.get("class", [])
        if "section-collapsed" not in classes:
            classes.append("section-collapsed")
            section["class"] = classes
            count_collapsed += 1
            
    print(f"  Collapsed {count_collapsed} sections (total {len(sections)}).")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))
    print(f"  Saved {filename}.")

for filename in FILES:
    clean_and_collapse(filename)
