from bs4 import BeautifulSoup

def inspect():
    file_path = 'web/public/uploads/docs/dep12_section2.html'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
    except Exception as e:
        print(f"Error reading local file: {e}")
        return

    main_tag = soup.find('main')
    if not main_tag:
        print("Main tag missing.")
        return
        
    section = main_tag.find('section')
    if not section:
        print("Section tag missing.")
        return
        
    div_content = section.find('div', class_='content-block')
    if not div_content:
        print("Content-block missing.")
        return
        
    wrapper_div = list(div_content.contents)[0] # Assuming only 1 node
    print(f"Wrapper has {wrapper_div.name} tag.")
    
    kids = list(wrapper_div.contents)
    print(f"Wrapper children: {len(kids)}")
    
    for i, k in enumerate(kids):
        if hasattr(k, 'name'):
            txt = str(k)[:50].replace('\n', ' ')
            print(f"Child {i} <{k.name}>: {txt}...")
            if "رموز الآليات" in str(k):
                print("  --> Match 'رموز الآليات'")
                if k.name == 'p':
                     print("    It is a <p>!")
        else:
            print(f"Child {i} [Text]: {str(k)[:20]}") 

if __name__ == "__main__":
    inspect()
