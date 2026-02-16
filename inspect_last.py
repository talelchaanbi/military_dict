from bs4 import BeautifulSoup
import sys

def inspect_last_child():
    file_path = 'web/public/uploads/docs/dep12_section2.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    sec1 = soup.find('section', id='part1')
    cb = sec1.find('div', class_='content-block')
    children = list(cb.children)
    print(f"Total children: {len(children)}")
    
    last = children[-1]
    print(f"Last child name: {last.name}")
    print(f"Last child text len: {len(last.get_text())}")
    print(f"Last child preview: {str(last)[:200]}")
    
    # Check if this last child actually contains the rest of the document?
    if len(last.get_text()) > 500:
        print("Last child is huge!")
    else:
        print("Last child is small.")
        
    # Maybe the parser stopped early?
    # BS4 usually handles bad HTML.
    
    # Let's check the size of the whole soup
    print(f"Soup text len: {len(soup.get_text())}")

if __name__ == "__main__":
    inspect_last_child()
