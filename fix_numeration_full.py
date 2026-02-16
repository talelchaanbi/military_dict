from bs4 import BeautifulSoup
import glob
import os

def fix_numeration():
    # Target all dep12 section files
    files = glob.glob('web/public/uploads/docs/dep12_section*.html')
    files.sort()
    
    for file_path in files:
        print(f"Processing {os.path.basename(file_path)}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
            
        tables = soup.find_all('table')
        if not tables:
            print("  No tables found.")
            continue
            
        modified_count = 0
        
        for idx, table in enumerate(tables):
            rows = table.find_all('tr')
            if not rows: continue
            
            # Check Header
            header_row = rows[0]
            header_cells = header_row.find_all(['td', 'th'])
            if not header_cells: continue
            
            first_header = header_cells[0].get_text(strip=True)
            
            if first_header == '#' or first_header == 'الرقم':
                print(f"  Table {idx+1}: Numbering...")
                
                row_num = 1
                skip_rows = 0
                
                for row in rows[1:]:
                    cols = row.find_all(['td', 'th'])
                    if not cols: continue
                    
                    if skip_rows > 0:
                        skip_rows -= 1
                        continue
                    
                    # Target cell
                    td = cols[0]
                    
                    # Handle Rowspan
                    rs = td.get('rowspan')
                    if rs:
                        try:
                            skip_rows = int(rs) - 1
                        except:
                            pass
                    
                    # Check text
                    txt = td.get_text(strip=True)
                    if not txt:
                        # Empty -> Fill
                        td.string = str(row_num)
                        modified_count += 1
                        row_num += 1
                    else:
                        # Not empty -> Check if it is a number
                        # If it's a number, update our counter to match + 1
                        if txt.isdigit():
                            row_num = int(txt) + 1
                        else:
                            # It's text? If row num counter depends on it?
                            # Assume it consumes a number
                            row_num += 1
            else:
                 # print(f"  Table {idx+1}: Skip (Header is '{first_header}')")
                 pass
                 
        if modified_count > 0:
            print(f"  Updates: {modified_count} cells filled.")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(str(soup))
        else:
            print("  No changes needed.")

if __name__ == "__main__":
    fix_numeration()
