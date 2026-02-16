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

NEW_SCRIPT_FRAGMENT = """
    /* --- Lightbox Logic --- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
    }

    // Delegate click event for images in main content
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG' && e.target.closest('main')) {
            // Check if it is not an icon or ui element
            if (!e.target.classList.contains('icon') && !e.target.classList.contains('ui-img')) {
                e.stopPropagation();
                openLightbox(e.target.src);
            }
        }
        // Also handle if lightbox itself is clicked (to close)
        if (e.target.id === 'lightbox') {
            closeLightbox();
        }
    });
"""

def fix_lightbox_script(filename):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    print(f"Fixing lightbox in {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Locate the main script tag. Usually the last one.
    scripts = soup.find_all("script")
    if not scripts:
        print("  No script tag found!")
        return

    main_script = scripts[-1]
    
    # We want to replace the lightbox logic inside the script.
    # Since parsing JS with python is hard, we will append our new logic 
    # and try to remove old logic using string replacement on the soup string?
    # Or better: Just replace the script content if we know the structure.
    
    # Let's inspect the script content.
    script_content = main_script.string
    if not script_content:
        # It might be empty or src based? 
        # In our case it is inline script.
        pass

    # A safer approach: Remove old lightbox logic if present, then append new.
    # The old logic in dep12_section1 starts with `/* 4. Lightbox */`
    # The old logic in others starts with `const lightbox = ...`
    
    # We will redefine the functions. JS allows redefining (in global scope, vars might conflict if using let/const).
    # Since 'const lightbox' is used, re-declaring it will cause SyntaxError.
    # We must replace the code.
    
    new_script_content = script_content
    
    # Pattern to remove old lightbox code block
    # It usually ends before `function toggleSection` or end of script
    import re
    
    # Strategy: Replace the entire script tag content with a standardized one based on what we know is in there.
    # But that deletes other custom logic.
    # Let's try to identify the blocks.
    
    # Block 1: Sidebar Toggle
    # Block 2: Search
    # Block 3: Scroll Top
    # Block 4: Lightbox (Target to replace)
    # Block 5: Toggle Section
    
    # We will reconstruct the script entirely to be safe and consistent.
    standard_script = """
    function toggleSidebar() {
        const aside = document.querySelector('aside');
        const overlay = document.getElementById('sidebarOverlay');
        aside.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    /* Search */
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const navLinks = document.querySelectorAll('.nav-link');
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            navLinks.forEach(link => {
                const text = link.textContent.toLowerCase();
                if (text.includes(term)) {
                    link.style.display = 'block';
                } else {
                    link.style.display = 'none';
                }
            });
        });
    }

    /* Scroll Spy & Scroll Top */
    const scrollBtn = document.getElementById('scrollTopBtn');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            if(scrollBtn) scrollBtn.classList.remove('hidden');
        } else {
            if(scrollBtn) scrollBtn.classList.add('hidden');
        }
        
        let current = '';
        sections.forEach(section => {
            // Offset for sticky header
            if (window.scrollY >= (section.offsetTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* Lightbox (Fixed) */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');

    function openLightbox(src) {
        if(lightbox && lightboxImg) {
            lightboxImg.src = src;
            lightbox.classList.add('active');
        }
    }

    function closeLightbox() {
        if(lightbox) lightbox.classList.remove('active');
    }

    // Global click listener for images
    document.addEventListener('click', function(e) {
        // Lightbox closing
        if (e.target.id === 'lightbox') {
            closeLightbox();
            return;
        }

        // Image clicking
        if (e.target.tagName === 'IMG') {
            // Check if inside main to avoid sidebar icons/logos if any
            if (e.target.closest('main')) {
                // Prevent interfering with other specific UI images if needed
                e.stopPropagation();
                openLightbox(e.target.src);
            }
        }
    });

    /* Section Toggling */
    function toggleSection(header) {
        const section = header.closest('section');
        if(section) section.classList.toggle('section-collapsed');
    }
    """
    
    main_script.string = standard_script
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))
    print(f"  Updated script in {filename}.")

for filename in FILES:
    fix_lightbox_script(filename)
