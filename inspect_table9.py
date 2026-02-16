from bs4 import BeautifulSoup

def inspect_partial_table():
    file_path = 'web/public/uploads/docs/dep12_section2.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    tables = soup.find_all('table')
    # Table 9 is index 8
    if len(tables) > 8:
        t = tables[8]
        rows = t.find_all('tr')
        print(f"Table 9 has {len(rows)} rows")
        for i, row in enumerate(rows):
            cols = row.find_all(['td', 'th'])
            if cols:
                print(f"Row {i}: '{cols[0].get_text(strip=True)}'")

if __name__ == "__main__":
    inspect_partial_table()
