import re

file_path = 'web/public/uploads/docs/dep12_section1.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all strong tags to see potential headers
matches = re.findall(r'<p[^>]*>\s*<strong>(.*?)</strong>\s*</p>', content, re.DOTALL)
print("Found strong headers:")
for m in matches:
    print(f"- {m}")

# Find table starts
table_matches = re.finditer(r'<table', content)
print(f"\nFound {len(list(table_matches))} tables.")

# specific check for the "Size" section
if "الحجم" in content:
    print("\nFound 'الحجم' in content.")
