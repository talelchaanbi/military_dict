from bs4 import BeautifulSoup
import os

FILES = [
    "dep12_section1.html",
    "dep12_section2.html", 
    "dep12_section3.html",
    "dep13_section1.html",
    # Add others needed later
]

BASE_DIR = "/home/mdn/Desktop/military_dict/web/public/uploads/docs"

CSS_TO_BE_REPLACED = """.lightbox img {
            max-width: 90%;
            max-height: 90%;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            cursor: default;
            border-radius: 4px;
        }"""

NEW_CSS = """.lightbox img {
            /* Better Zoom/Scale Logic */
            /* If the image is large, it scales down to fit viewport (max-width/height). */
            /* But if it's small, we want to allow it to grow or at least stay centered and be clear. */
            
            /* To force a zoom effect even on small images (make them larger than intrinsic size): */
            /* Use min-width or transform scale */
            /* However, scaling small images makes them blurry. */
            /* User complained "same dimension, not a zoom, just a focus". */
            /* This means they see the image at natural size centered on black. */
            
            /* Let's try to make it fill more space, even if slightly upscaled. */
            width: auto;
            height: auto;
            max-width: 95vw;
            max-height: 95vh;
            
            /* If user wants to force zoom, we can set a min-width */
            /* min-width: 50vw; */ 
            
            /* Or use object-fit logic if we fix dimensions */
            object-fit: contain;

            box-shadow: 0 0 25px rgba(0,0,0,0.7);
            border-radius: 4px;
            
            /* Transition for smooth opening */
            transition: transform 0.3s ease-out;
            transform: scale(0.95);
        }
        .lightbox.active img {
            transform: scale(1);
        }
"""

# Actually, replacing CSS via soup is messy if it's inside a large <style> block.
# We will just append an override style block at the end of <head> or <body>. 
# CSS specificity will apply if later in document order.

OVERRIDE_STYLE = """
    <style>
        /* Enhanced Lightbox Styles - Overrides */
        .lightbox {
            background-color: rgba(0,0,0,0.92); /* Darker backdrop */
            backdrop-filter: blur(8px);
        }
        
        .lightbox img {
            /* Force images to be larger if they are small, up to screen limits */
            /* This addresses "same dimension" */
            min-width: 400px; /* Force at least this width */
            min-height: 300px;
            
            /* But respect aspect ratio and screen size */
            max-width: 95vw; 
            max-height: 95vh;
            
            width: auto;
            height: auto;
            
            object-fit: contain;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            border: 2px solid rgba(255,255,255,0.1);
            
            transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
            transform: scale(0.9);
            opacity: 0;
        }
        
        .lightbox.active img {
            transform: scale(1);
            opacity: 1;
        }
        
        @media (max-width: 600px) {
            .lightbox img {
                min-width: 90vw; /* On mobile, take full width */
                min-height: auto;
            }
        }
    </style>
"""

def enhance_lightbox_css(filename):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    print(f"Enhancing lightbox CSS in {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Check if we already added overrides
    # (Checking for a comment or specific class style might be fragile, just append to head)
    head = soup.head
    if not head:
        head = soup.new_tag("head")
        soup.html.insert(0, head)

    # Append the new style block
    # We use a unique ID or comment to identify if we added it before?
    # Or just add it. Browsers handle multiple <style> tags fine.
    
    # Let's remove any previous override if we ran this script multiple times
    # We can mark our style tag with an id
    existing = head.find("style", id="lightbox-override")
    if existing:
        existing.extract()
        
    new_style = soup.new_tag("style", id="lightbox-override")
    new_style.string = """
        /* Enhanced Lightbox Styles */
        .lightbox {
            background-color: rgba(0,0,0,0.95) !important;
            backdrop-filter: blur(5px);
        }
        .lightbox img {
            /* Reset specific dimensions */
            max-width: 95vw !important;
            max-height: 95vh !important;
            
            /* Apply a transformative zoom effect */
            /* Using transform: scale(1.5) or similar on click? */
            /* No, lightbox usually just fits to screen. */
            /* Use min-width to force small images to scale UP */
            min-width: 60%; 
            /* But respect aspect ratio */
            width: auto;
            height: auto;
            
            object-fit: contain;
            box-shadow: 0 0 30px rgba(0,0,0,0.8);
            border: 1px solid #333;
            
            transform: scale(0.8);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .lightbox.active img {
            transform: scale(1);
            opacity: 1;
        }
        
        /* Specific fix for very small images or vertical images */
        @media (max-width: 768px) {
            .lightbox img {
                min-width: 95%;
            }
        }
    """
    head.append(new_style)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))
    print(f"  Added CSS override to {filename}.")

for filename in FILES:
    enhance_lightbox_css(filename)
