from bs4 import BeautifulSoup
import os
import re

# This script refactors a flat HTML file into the "Ergonomic Sidebar Layout"
# and then applies the dynamic UI enhancements (Search, Toggle, Lightbox).

def refactor_file(file_path):
    print(f"Processing {file_path}...")
    
    with open(file_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, "html.parser")

    # 1. Extract Content
    # In dep12_section2.html, content is inside <div class="doc-content"> or just <main>
    # The read_file extraction showed <main> and .doc-content
    
    main_content = soup.find("main")
    if not main_content:
        # Fallback if no main tag
        main_content = soup.find("body")
    
    # We need to preserve the content but reorganize it into sections based on H1/H2/H3
    # Let's find the content wrapper.
    content_wrapper = soup.find(class_="doc-content")
    if not content_wrapper:
        content_wrapper = main_content

    # 2. Setup New Structure
    # Create the skeleton of the new layout
    new_soup = BeautifulSoup("<!DOCTYPE html><html dir='rtl' lang='ar'></html>", "html.parser")
    html = new_soup.find("html")
    
    head = new_soup.new_tag("head")
    html.append(head)
    
    # Meta tags
    meta_charset = new_soup.new_tag("meta", charset="utf-8")
    head.append(meta_charset)
    meta_viewport = new_soup.new_tag("meta", attrs={"content": "width=device-width, initial-scale=1", "name": "viewport"})
    head.append(meta_viewport)
    
    # Title
    old_title = soup.find("title")
    title_text = old_title.string if old_title else "الوثيقة"
    title_tag = new_soup.new_tag("title")
    title_tag.string = title_text
    head.append(title_tag)
    
    # Fonts
    link_font = new_soup.new_tag("link", href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap", rel="stylesheet")
    head.append(link_font)

    # Styles (The Main CSS)
    style_tag = new_soup.new_tag("style")
    style_tag.string = """
        :root {
            --primary-color: #1e40af;
            --bg-color: #f1f5f9;
            --text-color: #1e293b;
            --sidebar-width: 300px;
        }

        * { box-sizing: border-box; }

        body {
            font-family: "Cairo", sans-serif;
            margin: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
            display: flex;
            min-height: 100vh;
        }

        /* --- Sidebar --- */
        aside {
            width: var(--sidebar-width);
            background: white;
            border-left: 1px solid #e2e8f0;
            position: fixed;
            top: 0;
            bottom: 0;
            right: 0;
            overflow-y: auto;
            padding: 20px;
            z-index: 1000;
            box-shadow: -4px 0 15px rgba(0,0,0,0.05);
            transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        aside h2 {
            font-size: 1.2rem;
            color: var(--primary-color);
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
            margin-top: 10px;
        }

        .nav-link {
            display: block;
            padding: 12px 15px;
            color: #475569;
            text-decoration: none;
            border-radius: 8px;
            margin-bottom: 5px;
            transition: all 0.2s;
            font-size: 0.95rem;
            font-weight: 600;
        }

        .nav-link:hover, .nav-link.active {
            background-color: #eff6ff;
            color: var(--primary-color);
            transform: translateX(-5px);
        }

        /* --- Main Content --- */
        main {
            margin-right: var(--sidebar-width);
            flex: 1;
            padding: 40px;
            max-width: 1200px;
        }

        /* --- Sections --- */
        section {
            background: white;
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 40px;
            border: 1px solid #e2e8f0;
            scroll-margin-top: 20px;
        }

        h3.section-title {
            color: var(--primary-color);
            font-size: 1.5rem;
            margin-top: 0;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
        }

        .section-number {
            background: var(--primary-color);
            color: white;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
            margin-left: 15px;
        }

        /* --- Typography & Elements --- */
        .content-block {
            line-height: 2;
            font-size: 1.05rem;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .content-block p { margin-bottom: 15px; }
        .content-block ul, .content-block ol { margin-right: 20px; }
        .content-block li { margin-bottom: 10px; }
        strong { color: #0f172a; font-weight: 700; }

        /* Images */
        img {
            max-width: 100%;
            height: auto;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            margin: 15px 0;
            padding: 5px;
            background: #fff;
            display: block;
            cursor: zoom-in;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        img:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .inline-img {
            display: inline-block;
            vertical-align: middle;
            margin: 0 5px;
            max-height: 40px;
            width: auto;
        }

        /* Tables */
        .table-container {
            overflow-x: auto;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
        }
        th, td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
            text-align: right;
            vertical-align: top;
        }
        th {
            background-color: #f8fafc;
            font-weight: 700;
            color: var(--primary-color);
        }

        /* --- UI Enhancements CSS --- */
        html { scroll-behavior: smooth; }

        /* Tools */
        .fixed-tools {
            position: fixed;
            bottom: 30px;
            left: 30px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 2000;
        }
        .tool-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: transform 0.2s, background 0.2s;
            font-size: 1.5rem;
        }
        .tool-btn:hover {
            transform: scale(1.1);
            background-color: #1e3a8a;
        }
        .tool-btn.hidden { display: none; }

        /* Mobile Menu */
        .menu-toggle {
            display: none;
            position: fixed;
            top: 20px;
            left: 20px; 
            z-index: 2001;
        }

        /* Sidebar Search */
        .sidebar-search {
            margin-bottom: 20px;
            position: relative;
        }
        .sidebar-search input {
            width: 100%;
            padding: 10px 15px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-family: "Cairo", sans-serif;
        }

        /* Lightbox */
        .lightbox {
            display: none;
            position: fixed;
            z-index: 3000;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
            justify-content: center;
            align-items: center;
            cursor: zoom-out;
            padding: 20px;
            backdrop-filter: blur(5px);
        }
        .lightbox img {
            max-width: 90%;
            max-height: 90%;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            cursor: default;
            border: none;
            border-radius: 4px;
        }
        .lightbox.active { display: flex; }

        /* Collapsible Headers */
        .section-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            width: 100%;
        }
        .collapse-icon {
            font-size: 1.2rem;
            color: #94a3b8;
            transition: transform 0.3s;
            margin-right: auto;
            margin-left: 10px;
        }
        .section-collapsed .content-block { display: none; }
        .section-collapsed .collapse-icon { transform: rotate(180deg); }

        /* Responsive */
        @media (max-width: 1024px) {
            body { flex-direction: column; }
            aside {
                position: fixed;
                width: 280px;
                right: -300px;
                left: auto;
                top: 0; 
                bottom: 0;
                border-left: 1px solid #e2e8f0;
                z-index: 2500;
                height: 100vh;
            }
            aside.open {
                right: 0;
                box-shadow: -10px 0 20px rgba(0,0,0,0.1);
            }
            main {
                margin-right: 0;
                padding: 20px;
                padding-top: 80px;
            }
            .menu-toggle {
                display: flex;
                right: 20px;
                left: auto;
            }
            .sidebar-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 2400;
                backdrop-filter: blur(2px);
            }
            .sidebar-overlay.active { display: block; }
        }
    """
    head.append(style_tag)

    body = new_soup.new_tag("body")
    html.append(body)

    # UI Elements (Sidebar, Main, Buttons)
    menu_btn = new_soup.new_tag("button", attrs={"class": "tool-btn menu-toggle", "id": "menuBtn", "onclick": "toggleSidebar()"})
    menu_btn.string = "☰"
    body.append(menu_btn)

    overlay = new_soup.new_tag("div", attrs={"class": "sidebar-overlay", "id": "sidebarOverlay", "onclick": "toggleSidebar()"})
    body.append(overlay)

    lightbox = new_soup.new_tag("div", attrs={"class": "lightbox", "id": "lightbox", "onclick": "closeLightbox()"})
    lightbox_img = new_soup.new_tag("img", attrs={"id": "lightboxImg"})
    lightbox.append(lightbox_img)
    body.append(lightbox)

    fixed_tools = new_soup.new_tag("div", attrs={"class": "fixed-tools"})
    scroll_btn = new_soup.new_tag("button", attrs={"class": "tool-btn hidden", "id": "scrollTopBtn", "title": "إلى الأعلى", "onclick": "scrollToTop()"})
    scroll_btn.string = "▲"
    fixed_tools.append(scroll_btn)
    body.append(fixed_tools)

    # Structure Containers
    aside = new_soup.new_tag("aside")
    
    # Sidebar components
    search_div = new_soup.new_tag("div", attrs={"class": "sidebar-search"})
    search_input = new_soup.new_tag("input", attrs={"type": "text", "placeholder": "بحث في العناوين...", "id": "searchInput"})
    search_div.append(search_input)
    aside.append(search_div)
    
    index_title = new_soup.new_tag("h2")
    index_title.string = "فهرس الوثيقة"
    aside.append(index_title)
    
    nav = new_soup.new_tag("nav")
    aside.append(nav)
    
    body.append(aside)
    
    main = new_soup.new_tag("main")
    body.append(main)

    # 3. Content Segmentation Logic
    # We iterate through the original content and create sections based on headlings
    # It seems user content uses h1, h2, h3. Ideally we identify "Major" headers as split points.
    
    # Let's clean the content_wrapper first (remove scripts, styles)
    for s in content_wrapper(["script", "style", "meta", "link", "title"]):
        s.decompose()

    # Strategy:
    # 1. Create a default section.
    # 2. Iterate specific block-level tags.
    # 3. If H1, H2, or H3 is found, close current section and start new one? 
    #    H1/H2 usually indicates a big section. H3 usually subsection.
    #    Let's check the hierarchy in dep12_section2.html specifically.
    
    current_section = None
    current_content_block = None
    section_counter = 0

    # Check if already refactored (contains 'part1' id and 'content-block' class)
    existing_sections = soup.find_all("section", id=re.compile(r"part\d+"))
    
    if existing_sections and soup.find("aside"):
        print("   (File appears already refactored, extracting content to re-process...)")
        elements = []
        for sec in existing_sections:
            block = sec.find(class_="content-block")
            if block:
                # Helper to flatten nested sections recursively
                to_process = list(block.contents)
                while to_process:
                    curr = to_process.pop(0)
                    if curr.name == 'section' and curr.get('class') is None: # Standard sections usually don't have class, or check id
                         # It's a nested section, grab its content-block content
                         inner_block = curr.find(class_="content-block")
                         if inner_block:
                             # Add inner contents to the FRONT of processing queue to maintain order? 
                             # Actually popping 0 means we act like a queue. 
                             # If we want to maintain document order, we should insert at index 0?
                             # No, pop(0) takes from front. If we find a section, we want to replace it with its children.
                             # Python list insert is slow but fine here.
                             children = list(inner_block.contents)
                             for child in reversed(children):
                                 to_process.insert(0, child)
                         else:
                             # Just a section without content block? Unlikely but append its children
                             children = list(curr.contents)
                             for child in reversed(children):
                                 to_process.insert(0, child)
                    
                    elif curr.name == 'div' and curr.get('class') == ['doc-content']:
                         # Another wrapper possibility
                         children = list(curr.contents)
                         for child in reversed(children):
                             to_process.insert(0, child)

                    else:
                        elements.append(curr)
    else:
        elements = content_wrapper.find_all(recursive=False) # Get direct children
        
        # If no content wrapper found properly, try all children of body
        if not elements and not content_wrapper.find("p"): 
             elements = soup.body.find_all(recursive=False)

        # Unwrap single container divs (common in exports) to find headers
        # We loop safely to avoid infinite loops if structure is weird
        for _ in range(3): 
            if len(elements) == 1 and elements[0].name == 'div':
                elements = elements[0].find_all(recursive=False)
            else:
                break

    # Create first section
    section_counter += 1
    current_section = new_soup.new_tag("section", id=f"part{section_counter}")
    
    # Header for first section
    header_div = new_soup.new_tag("h3", attrs={"class": "section-title"})
    header_row = new_soup.new_tag("div", attrs={"class": "section-header-row", "onclick": "toggleSection(this)"})
    title_span = new_soup.new_tag("span")
    number_span = new_soup.new_tag("span", attrs={"class": "section-number"})
    number_span.string = str(section_counter)
    
    # Default title if none found immediately
    title_text_span = new_soup.new_tag("span")
    title_text_span.string = "مقدمة"
    
    title_span.append(number_span)
    title_span.append(title_text_span)
    header_row.append(title_span)
    header_row.append(BeautifulSoup("<span class='collapse-icon'>▼</span>", "html.parser"))
    header_div.append(header_row)
    current_section.append(header_div)
    
    current_content_block = new_soup.new_tag("div", attrs={"class": "content-block"})
    current_section.append(current_content_block)
    
    # Nav link for first section
    nav_link = new_soup.new_tag("a", href=f"#part{section_counter}", attrs={"class": "nav-link"})
    nav_link.string = f"{section_counter}. مقدمة"
    nav.append(nav_link)

    main.append(current_section)

    for element in elements:
        # Detect Header to split sections
        # We'll split on keys that look like Headers.
        # In typical doc exports, h1, h2 are main headers.
        if element.name in ['h1', 'h2']:
            # Start new section
            section_counter += 1
            current_section = new_soup.new_tag("section", id=f"part{section_counter}")
            main.append(current_section)
            
            header_text = element.get_text().strip() or f"قسم {section_counter}"
            
            # Create Section Header Structure
            header_div = new_soup.new_tag("h3", attrs={"class": "section-title"}) # We standardize on H3 style for module title
            header_row = new_soup.new_tag("div", attrs={"class": "section-header-row", "onclick": "toggleSection(this)"})
            
            title_span = new_soup.new_tag("span")
            number_span = new_soup.new_tag("span", attrs={"class": "section-number"})
            number_span.string = str(section_counter)
            
            title_text_span = new_soup.new_tag("span")
            title_text_span.string = header_text
            
            title_span.append(number_span)
            title_span.append(title_text_span)
            
            header_row.append(title_span)
            header_row.append(BeautifulSoup("<span class='collapse-icon'>▼</span>", "html.parser"))
            header_div.append(header_row)
            
            current_section.append(header_div)
            
            # Content Block
            current_content_block = new_soup.new_tag("div", attrs={"class": "content-block"})
            current_section.append(current_content_block)
            
            # Add to Nav
            nav_link = new_soup.new_tag("a", href=f"#part{section_counter}", attrs={"class": "nav-link"})
            nav_link.string = f"{section_counter}. {header_text}"
            nav.append(nav_link)
        
        else:
            # Append content
            # If it's a card div from previous structure, unpack it?
            if element.name == 'div' and ('card' in element.get('class', [])):
                for child in element.contents:
                     current_content_block.append(child)
            else:
                current_content_block.append(element)

    # 4. Inject JS
    script_tag = new_soup.new_tag("script")
    script_tag.string = """
    function toggleSidebar() {
        document.querySelector('aside').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('active');
    }

    const searchInput = document.getElementById('searchInput');
    const navLinks = document.querySelectorAll('.nav-link');

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        navLinks.forEach(link => {
            if (link.textContent.toLowerCase().includes(term)) {
                link.style.display = 'block';
            } else {
                link.style.display = 'none';
            }
        });
    });

    const scrollBtn = document.getElementById('scrollTopBtn');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.remove('hidden');
        } else {
            scrollBtn.classList.add('hidden');
        }
        
        let current = '';
        sections.forEach(section => {
            if (pageYOffset >= (section.offsetTop - 150)) {
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

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    // Delegate event for images
    document.querySelector('main').addEventListener('click', function(e) {
        if(e.target.tagName === 'IMG') {
            e.stopPropagation();
            lightboxImg.src = e.target.src;
            lightbox.classList.add('active');
        }
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
    }

    function toggleSection(header) {
        header.closest('section').classList.toggle('section-collapsed');
    }
    """
    body.append(script_tag)

    # Write output
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(str(new_soup))
    print(f"File {file_path} refactored successfully.")

# Processing other HTML files
TARGET_DIR = "/home/mdn/Desktop/military_dict/web/public/uploads/docs"
FILES_TO_PROCESS = [
    # Add files you want to convert. 
    # Skipping dep12_section1.html as it is already enhanced.
    "dep12_section2.html", 
    "dep12_section3.html",
    "dep13_section1.html",
    "dep13_section2.html",
    "dep13_section3.html",
    "dep13_section4.html",
    "dep13_section5.html"
]

for filename in FILES_TO_PROCESS:
    f_path = os.path.join(TARGET_DIR, filename)
    if os.path.exists(f_path):
        refactor_file(f_path)
    else:
        print(f"Skipping {filename} (not found)")
