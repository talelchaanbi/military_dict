from bs4 import BeautifulSoup
import re

def inspect_nodes():
    file_path = 'web/public/uploads/docs/dep12_section2.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    main_tag = soup.find('main')
    sections = main_tag.find_all('section')
    print(f"File has {len(sections)} sections.")
    
    total_nodes = 0
    headers_detected = 0
    
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
    
    for sec in sections:
        content_div = sec.find('div', class_='content-block')
        if content_div:
            nodes = list(content_div.children)
            print(f"Section {sec.get('id')} has {len(nodes)} direct children.")
            total_nodes += len(nodes)
            
            for i, node in enumerate(nodes):
                if node.name == 'p':
                    txt = node.get_text(" ", strip=True)
                    # Check matching
                    match = ""
                    for kt in KNOWN_TITLES:
                        if kt in txt and (node.find('strong') or "strong" in str(node)):
                            match = kt
                            break
                    if match:
                        print(f"  [Node {i}] HEADER FOUND: {match}")
                        headers_detected += 1
                    else:
                        # Print generic p content preview
                        if len(txt) < 50:
                            print(f"  [Node {i}] P: {txt}")
                elif node.name == 'div':
                    print(f"  [Node {i}] DIV ({node.get('class')})")
    
    print(f"Total nodes: {total_nodes}")
    print(f"Headers detected: {headers_detected}")

if __name__ == "__main__":
    inspect_nodes()
