from bs4 import BeautifulSoup

def inspect_siblings():
    file_path = 'web/public/uploads/docs/dep12_section2.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    main_tag = soup.find('main')
    print(f"Main children count: {len(list(main_tag.children))}")
    
    sections = main_tag.find_all('section')
    print(f"Sections found: {len(sections)}")
    
    if sections:
        sec1 = sections[0]
        content_block = sec1.find('div', class_='content-block')
        
        if content_block:
             # Check if there are siblings AFTER content_block
             siblings = list(content_block.next_siblings)
             clean_sibs = [s for s in siblings if str(s).strip()]
             print(f"Siblings after content-block: {len(clean_sibs)}")
             for sib in clean_sibs[:5]:
                 if sib.name:
                     print(f"  Sibling: {sib.name}")
                 else:
                     print(f"  Sibling Text: {str(sib)[:50]}...")
        else:
            print("No content-block in section 1")
            
        # Check siblings of section 1
        sibs_sec = list(sec1.next_siblings)
        clean_sec_sibs = [s for s in sibs_sec if str(s).strip()]
        print(f"Siblings after section 1: {len(clean_sec_sibs)}")
        for sib in clean_sec_sibs[:5]:
             if sib.name:
                 print(f"  Sec Sibling: {sib.name}")
             else:
                 print(f"  Sec Sibling Text: {str(sib)[:50]}...")

if __name__ == "__main__":
    inspect_siblings()
