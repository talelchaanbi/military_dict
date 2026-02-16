from bs4 import BeautifulSoup

def dry_run_fix():
    file_path = 'web/public/uploads/docs/dep12_section2.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    tables = soup.find_all('table')
    t = tables[8] # Table 9
    
    rows = t.find_all('tr')
    
    # Check header
    header = rows[0].find_all('td')
    if not header: header = rows[0].find_all('th')
    print(f"Header: {[c.get_text(strip=True) for c in header]}")
    
    row_num = 1
    skip_rows = 0
    
    for i, row in enumerate(rows[1:], 1):
        cols = row.find_all('td')
        if not cols: continue
        
        status = ""
        action = ""
        
        if skip_rows > 0:
            status = f"skipped (implicit col0), skip left: {skip_rows}"
            skip_rows -= 1
            # Processing Col 1 as first in markup
            first_text = cols[0].get_text(strip=True)[:20]
            action = f"Ignore '{first_text}'"
        else:
            status = "Processing Col 0"
            td = cols[0]
            txt = td.get_text(strip=True)
            
            rs = td.get('rowspan')
            if rs:
                skip_rows = int(rs) - 1
                status += f" [Rowspan={rs}]"
            
            if not txt:
                action = f"SET FILL: {row_num}"
                row_num += 1
            else:
                action = f"Preserve '{txt}'"
                row_num += 1

        print(f"Row {i:2d}: {status} | Action: {action}")

if __name__ == "__main__":
    dry_run_fix()
