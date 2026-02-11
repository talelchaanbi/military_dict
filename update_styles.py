import re
from pathlib import Path

# Target directory
docs_dir = Path('/home/mdn/Desktop/military_dict/web/public/uploads/docs')

# Modern CSS to inject
modern_style = """
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-body: #f8fafc;
      --bg-card: #ffffff;
      --text-main: #0f172a;
      --text-muted: #475569;
      --primary: #2563eb;
      --border: #e2e8f0;
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    * { box-sizing: border-box; }

    body {
      font-family: "Cairo", system-ui, -apple-system, sans-serif;
      background-color: var(--bg-body);
      color: var(--text-main);
      margin: 0;
      padding: 0;
      line-height: 1.8;
      direction: rtl;
    }

    header {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      padding: 1rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    header strong {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-main);
    }

    main {
      width: 100%;
      max-width: 1024px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .card, .doc-content {
      background: var(--bg-card);
      border-radius: 1rem;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      padding: 2.5rem;
      margin-bottom: 2rem;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-main);
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: 800;
      line-height: 1.3;
    }

    h1 { font-size: 2.25rem; letter-spacing: -0.02em; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
    h2 { font-size: 1.75rem; letter-spacing: -0.01em; }
    h3 { font-size: 1.5rem; }
    
    p { margin-bottom: 1.25rem; color: var(--text-muted); font-size: 1.05rem;}

    a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.15s;
    }
    a:hover { color: #1d4ed8; text-decoration: underline; }

    /* Lists */
    ul, ol { padding-right: 1.5rem; margin-bottom: 1.5rem; color: var(--text-muted); }
    li { margin-bottom: 0.5rem; }

    /* Tables */
    .table-wrap {
      overflow-x: auto;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
      margin: 2rem 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
      background: var(--bg-card);
    }

    th, td {
      padding: 1rem;
      text-align: right;
      border-bottom: 1px solid var(--border);
    }
    
    /* Vertical borders for cells */
    th:not(:last-child), td:not(:last-child) {
        border-left: 1px solid var(--border);
    }

    th {
      background-color: #f1f5f9;
      color: var(--text-main);
      font-weight: 700;
      white-space: nowrap;
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background-color: #f8fafc; }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      display: block;
      margin: 1.5rem auto;
    }
    
    /* Code/Pre */
    pre, code {
        direction: ltr;
        text-align: left;
        font-family: 'Fira Code', monospace;
    }

    /* Print styles */
    @media print {
      body { background: white; }
      .card { box-shadow: none; border: none; padding: 0; }
      header { display: none; }
    }
  </style>
"""

def update_file_style(file_path: Path):
    if not file_path.suffix == '.html':
        return

    content = file_path.read_text(encoding='utf-8')
    
    # Check if file has <style> tag
    if '<style>' not in content:
        print(f"Skipping {file_path.name}: No <style> tag found.")
        return

    # Use regex to replace everything from <style> to </style> 
    # and preferably inject the fonts before it if possible, 
    # but strictly checking structure.
    
    # We will replace the whole <style>...</style> block with our modern_style string.
    # Note: modern_style includes <link> tags which are valid in <head>.
    
    new_content = re.sub(
        r'<style>.*?</style>', 
        modern_style.strip(), 
        content, 
        flags=re.DOTALL
    )
    
    # Clean up potential duplicates if we run this multiple times
    # (The regex replacement is safe as it replaces the existing block)

    file_path.write_text(new_content, encoding='utf-8')
    print(f"Updated {file_path.name}")

# Iterate over all HTML files
for f in docs_dir.glob('*.html'):
    update_file_style(f)

print("All styles updated.")
