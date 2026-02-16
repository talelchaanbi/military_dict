from bs4 import BeautifulSoup
import re

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

def check():
    file_path = 'web/public/uploads/docs/dep12_section2.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    main_tag = soup.find('main')
    # Since I already ran the script, the file structure might be:
    # <section id="part1">...<div class="content-block">...</div></section>
    # <section id="part2">...
    # ...
    # And "رموز الآليات" should be inside section 5 "رموز النيران" if it wasn't split.
    
    sections = main_tag.find_all('section')
    print(f"Current sections: {len(sections)}")
    
    for sec in sections:
        title = sec.find('h3').get_text(strip=True)
        print(f"Section: {title}")
        
    # Find "رموز الآليات"
    target = soup.find(string=re.compile("رموز الآليات"))
    if target:
        parent = target.parent # strong
        p_node = parent.parent # p maybe
        print(f"Found target text in tag: {target.parent.name}")
        if p_node.name == 'p':
            print(f"Parent is P. Text: '{p_node.get_text()}'")
            
            # Use my logic
            text = p_node.get_text(" ", strip=True)
            matched = False
            for kt in KNOWN_TITLES:
                if kt in text:
                    print(f"Matches title: {kt}")
                    matched = True
            if matched:
                print("It MATCHES logic.")
            else:
                print("Logic FAIL.")
    else:
        print("Target text not found via BS4")

if __name__ == "__main__":
    check()
