
import os
from bs4 import BeautifulSoup

file_path = "/home/talel/Desktop/military_dict/web/public/uploads/docs/dep13.html"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, "r", encoding="utf-8") as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, "html.parser")

# 1. Clean up Tables
tables = soup.find_all("table")
for table in tables:
    # Check if already wrapped
    if table.parent and table.parent.name == "div" and "table-wrap" in table.parent.get("class", []):
        continue
    
    # Create wrapper
    wrapper = soup.new_tag("div", **{"class": "table-wrap"})
    table.wrap(wrapper)

    # Clean up inline styles from table cells that might strictly fix widths
    # for cell in table.find_all(["td", "th"]):
    #     if cell.has_attr("width"):
    #         del cell["width"]
    #     if cell.has_attr("style"):
    #          # Optional: careful not to remove essential styles, but usually 'width' is the enemy of responsive
    #          pass

# 2. Fix Images
images = soup.find_all("img")
for img in images:
    # Add doc-inline-asset class if not present
    classes = img.get("class", [])
    if "doc-inline-asset" not in classes:
        classes.append("doc-inline-asset")
        img["class"] = classes

# 3. Remove empty paragraphs
for p in soup.find_all("p"):
    if not p.get_text(strip=True) and not p.find("img"):
        p.decompose()

# 4. Save
with open(file_path, "w", encoding="utf-8") as f:
    f.write(str(soup))

print(f"Successfully processed {len(tables)} tables and {len(images)} images.")
