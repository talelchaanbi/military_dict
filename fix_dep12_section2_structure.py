import re
from bs4 import BeautifulSoup
import sys

# Define titles to search for
KNOWN_TITLES = [
    "رموز الصنوف والأسلحة والخدمات",
    "رموز النقاط والمراكز الإدارية والإدامة",
    "الرموز الأساسية للأسلحة",
    "رموز تعبيرية",
    "رموز النيران",
    "رموز الآليات",
    "رموز التحصينات",
    "رموز الموانع",
    "رموز الألغام",
    "رموز الطرق",
    "رموز الجسور",
    "رموز المغاوير"
]

def get_header_info(node):
    if node.name == 'p':
        text = node.get_text(" ", strip=True)
        # Check against known titles
        for title in KNOWN_TITLES:
            if title in text:
                # Basic validation: header shouldn't be too long
                if len(text) < 100:
                    # Check if it has strong tag or is bold
                    if node.find('strong') or "strong" in str(node):
                        return True, title
    return False, None

def fix_structure():
    file_path = 'web/public/uploads/docs/dep12_section2.html'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    main_tag = soup.find('main')
    if not main_tag:
        print("No main tag found")
        return

    # Extract ALL content from ALL existing sections
    all_nodes = []
    sections = main_tag.find_all('section')
    
    if not sections:
        # Maybe it's raw content in main?
        print("No sections found, trying raw main content...")
        all_nodes = list(main_tag.contents)
    else:
        print(f"Extracting content from {len(sections)} existing sections...")
        for sec in sections:
            content_div = sec.find('div', class_='content-block')
            if content_div:
                # We copy nodes to new list
                for child in content_div.contents:
                    all_nodes.append(child)
            else:
                 # Fallback if no content-block
                 for child in sec.contents:
                     if child.name != 'h3': # Skip the title header
                         all_nodes.append(child)

    print(f"Total nodes to process: {len(all_nodes)}")
    
    new_sections = []
    current_nodes = []
    current_title = "مقدمة" 
    
    headers_found = 0

    for node in all_nodes:
        # Skip empty strings / newlines if we want cleaner output, 
        # but better to keep formatting.
        
        is_header, title = get_header_info(node)
        
        if is_header:
            headers_found += 1
            print(f"Header Found: {title}")
            
            # Save previous section if it has meaningful content
            has_content = any(str(n).strip() for n in current_nodes)
            
            if has_content:
                new_sections.append({
                    'title': current_title,
                    'nodes': list(current_nodes)
                })
            else:
                # If "مقدمة" and empty, we skip.
                # If we have back-to-back headers, we might skip the empty one or treating it as a new section?
                # Usually back-to-back headers means:
                # "Part 1" (header)
                # "Part 2" (header) -> Part 1 was empty?
                # Here we operate on "title starts section".
                pass

            current_title = title
            current_nodes = []
            # We do NOT include the header paragraph in the content
        else:
            current_nodes.append(node)
            
    # Add the last section
    if current_nodes and any(str(n).strip() for n in current_nodes):
        new_sections.append({
            'title': current_title,
            'nodes': current_nodes
        })

    print(f"Found {len(new_sections)} new sections.")
    
    # Check if we should drop the first section if it's "مقدمة" and effectively empty
    if new_sections and new_sections[0]['title'] == "مقدمة":
        # Check text content length
        txt = "".join([n.get_text() for n in new_sections[0]['nodes']]).strip()
        if len(txt) < 50:
            print("Dropping empty/short 'مقدمة' section")
            new_sections.pop(0)

    # Rebuild Main
    main_tag.clear()
    
    # Handle Sidebar
    aside = soup.find('aside')
    nav = aside.find('nav')
    if not nav:
        nav = soup.new_tag('nav')
        aside.append(nav)
    nav.clear()
    
    for i, sec in enumerate(new_sections):
        sec_id = f"part{i+1}"
        title = sec['title']
        
        # Add to Sidebar
        link = soup.new_tag('a', href=f"#{sec_id}", attrs={'class': 'nav-link'})
        link.string = f"{i+1}. {title}"
        nav.append(link)
        
        # Create Section
        new_section = soup.new_tag('section', id=sec_id, attrs={'class': 'section-collapsed'})
        
        # Header
        h3 = soup.new_tag('h3', attrs={'class': 'section-title'})
        header_row = soup.new_tag('div', attrs={'class': 'section-header-row', 'onclick': 'toggleSection(this)'})
        
        span_wrapper = soup.new_tag('span')
        span_num = soup.new_tag('span', attrs={'class': 'section-number'})
        span_num.string = str(i+1)
        span_txt = soup.new_tag('span')
        span_txt.string = f" {title}"
        
        span_wrapper.append(span_num)
        span_wrapper.append(span_txt)
        
        icon = soup.new_tag('span', attrs={'class': 'collapse-icon'})
        icon.string = "▼"
        
        header_row.append(span_wrapper)
        header_row.append(icon)
        h3.append(header_row)
        new_section.append(h3)
        
        # Content
        div_block = soup.new_tag('div', attrs={'class': 'content-block'})
        for node in sec['nodes']:
            div_block.append(node)
            
        new_section.append(div_block)
        main_tag.append(new_section)
        
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))
        
    print("Successfully updated structure.")

if __name__ == "__main__":
    fix_structure()
