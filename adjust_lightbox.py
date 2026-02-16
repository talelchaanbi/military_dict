from bs4 import BeautifulSoup
import os

FILES = [
    "dep12_section1.html",
    "dep12_section2.html", 
    "dep12_section3.html",
    "dep13_section1.html",
]

BASE_DIR = "/home/mdn/Desktop/military_dict/web/public/uploads/docs"

def adjust_lightbox_css(filename):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    print(f"Adjusting lightbox CSS in {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Find the style tag we added previously (id="lightbox-override")
    # or just look for the style tag containing ".lightbox img"
    
    style_tag = soup.find("style", id="lightbox-override")
    
    new_css = """
        /* Enhanced Lightbox Styles - Adjusted */
        .lightbox {
            background-color: rgba(0,0,0,0.9) !important;
            backdrop-filter: blur(5px);
        }
        .lightbox img {
            /* Reset forcing dimensions to avoid blur */
            width: auto;
            height: auto;
            
            /* Constrain to screen size */
            max-width: 90vw !important;
            max-height: 90vh !important;
            
            /* Minimal size to ensure visibility but not too much stretching */
            /* We remove the aggressive min-width: 60% */
            min-width: 0 !important; 
            
            object-fit: contain;
            box-shadow: 0 0 30px rgba(0,0,0,0.8);
            border: 1px solid #444;
            border-radius: 4px;
            
            /* Optional: slight scale up for very small images, but safely? */
            /* No, let's keep it sharp. User prefers sharpness over size if blur is the issue. */
            
            transform: scale(0.9);
            opacity: 0;
            transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.3s ease;
            background-color: white; /* Verify transparent images look okay */
        }
        .lightbox.active img {
            transform: scale(1);
            opacity: 1;
        }
    """
    
    if style_tag:
        style_tag.string = new_css
        print("  Updated existing overlay style.")
    else:
        # Create new if not found (should be there)
        head = soup.head
        new_style = soup.new_tag("style", id="lightbox-override")
        new_style.string = new_css
        head.append(new_style)
        print("  Created new overlay style.")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))

for filename in FILES:
    adjust_lightbox_css(filename)
