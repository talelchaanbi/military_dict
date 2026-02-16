from bs4 import BeautifulSoup
import os

FILE_PATH = "/home/mdn/Desktop/military_dict/web/public/uploads/docs/dep12_section1.html"

def fix_section_9():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Find Section 9
    section9 = soup.find("section", id="part9")
    if not section9:
        print("Section 9 not found!")
        return

    # Check if content-block already exists
    if section9.find(class_="content-block"):
        print("Section 9 already has a content-block. Checking structure...")
        # (Could check if everything is inside it, but for now assuming if it exists it might be partial)
        # But user says it doesn't open/close, suggesting css fails.
        # Let's see what's directly inside section 9.
    
    # Get all children of section 9
    children = list(section9.children)
    
    # We want to keep the H3 (title) outside, and wrap everything else in a div.content-block
    header = section9.find("h3", class_="section-title")
    
    if not header:
        print("Header not found in Section 9!")
        return

    # content to wrap
    content_to_wrap = []
    
    # Flag to start collecting after header
    collecting = False
    
    for child in children:
        if child == header:
            collecting = True
            continue 
        
        if collecting:
            # Check if it's already a content-block?
            if child.name == "div" and "content-block" in child.get("class", []):
                print("Found existing content-block. Moving its contents out to merge or verify.")
                content_to_wrap.extend(child.contents)
                child.extract() # Remove the old container
            else:
                content_to_wrap.append(child)

    # Create new wrapper
    new_wrapper = soup.new_tag("div", attrs={"class": "content-block"})
    
    # Remove old children that we are moving (except header)
    for child in content_to_wrap:
        if child.parent: # Verify it's still attached
            child.extract()
        new_wrapper.append(child)
    
    # Append wrapper to section
    section9.append(new_wrapper)
    
    print("Wrapped content of Section 9 in .content-block")

    with open(FILE_PATH, "w", encoding="utf-8") as f:
        f.write(str(soup))

fix_section_9()
