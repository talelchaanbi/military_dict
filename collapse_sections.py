from bs4 import BeautifulSoup
import os

# Files to modify
FILES = [
    "dep12_section1.html",
    "dep12_section2.html",
    "dep12_section3.html"
]

BASE_DIR = "/home/mdn/Desktop/military_dict/web/public/uploads/docs"

def collapse_sections(filename):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    print(f"Collapsing sections in {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    sections = soup.find_all("section")
    for section in sections:
        # Check current classes
        classes = section.get("class", [])
        if "section-collapsed" not in classes:
            classes.append("section-collapsed")
            section["class"] = classes

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))
    print(f"  Processed {len(sections)} sections.")

for filename in FILES:
    collapse_sections(filename)
