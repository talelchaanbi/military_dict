from bs4 import BeautifulSoup
import os

FILE_PATH = "/home/mdn/Desktop/military_dict/web/public/uploads/docs/dep12_section1.html"

def fix_html_structure():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    body = soup.body
    if not body:
        print("No body tag found!")
        return

    # Find the UI elements that are currently at the bottom (after script?)
    # or just find them anywhere and move them to top of body.
    
    overlay = soup.find("div", id="sidebarOverlay")
    lightbox = soup.find("div", id="lightbox")
    tools = soup.find(class_="fixed-tools") # might be class only
    menu_btn = soup.find(id="menuBtn")
    
    # We want them at the start of body in this order:
    # 1. Menu Button
    # 2. Overlay
    # 3. Lightbox
    # 4. Fixed Tools
    
    # Note: BeautifulSoup insert(0, tag) inserts at the beginning.
    # To keep order 1,2,3,4, we should insert 4, then 3, then 2, then 1 at position 0.
    
    if tools:
        print("Moving fixed-tools to top.")
        tools.extract()
        body.insert(0, tools)
        
    if lightbox:
        print("Moving lightbox to top.")
        lightbox.extract()
        body.insert(0, lightbox)
        
    if overlay:
        print("Moving overlay to top.")
        overlay.extract()
        body.insert(0, overlay)

    if menu_btn:
        print("Moving menu button to top.")
        menu_btn.extract()
        body.insert(0, menu_btn)
    else:
        # Create menu button if missing (it might be missing in section 1?)
        # Let's check if it exists.
        print("Menu button not found, creating it.")
        new_btn = soup.new_tag("button", attrs={"class": "tool-btn menu-toggle", "id": "menuBtn", "onclick": "toggleSidebar()"})
        new_btn.string = "☰"
        body.insert(0, new_btn)

    with open(FILE_PATH, "w", encoding="utf-8") as f:
        f.write(str(soup))
    print("Fixed HTML structure for dep12_section1.html")

fix_html_structure()
