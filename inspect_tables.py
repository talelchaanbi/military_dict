from bs4 import BeautifulSoup
import glob
import os

def inspect_numeration():
    files = glob.glob('web/public/uploads/docs/dep12_section*.html')
    files.sort()
    
    for file_path in files:
        file_name = os.path.basename(file_path)
        print(f"\n--- Checking {file_name} ---")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
            
        tables = soup.find_all('table')
        if not tables:
            print("  No tables found.")
            continue
            
        for i, table in enumerate(tables):
            rows = table.find_all('tr')
            if not rows:
                continue
                
            # Check header
            header_row = rows[0]
            cells = header_row.find_all(['td', 'th'])
            if not cells:
                continue
                
            first_cell_text = cells[0].get_text(strip=True)
            
            # Check if first column is meant for numbering
            if first_cell_text == '#' or first_cell_text == 'الرقم':
                print(f"  Table {i+1}: Found numbering column '{first_cell_text}'")
                
                # Check first few data rows
                empty_count = 0
                total_data_rows = 0
                
                for row in rows[1:]:
                    cols = row.find_all('td')
                    if not cols: 
                        continue
                    total_data_rows += 1
                    
                    if not cols[0].get_text(strip=True):
                        empty_count += 1
                
                print(f"    Data Rows: {total_data_rows}, Empty First Cells: {empty_count}")
                if empty_count > 0:
                    print(f"    -> NEEDS FIXING")
            else:
                print(f"  Table {i+1}: First column is '{first_cell_text}' (Not numbering?)")

if __name__ == "__main__":
    inspect_numeration()
