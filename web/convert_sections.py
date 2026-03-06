import re
import os

style_and_head = """<!doctype html>
<html lang="ar" dir="rtl">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>الخرائط والشفافات والمخططات</title>

  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #ffffff;
      --card: hsl(79, 20%, 98%);
      --text: hsl(79, 19.5%, 20%);
      --sidebar: #2e4933;
      --accent: #d4af37;
      --border: hsl(79, 19.5%, 85%);
    }

    body.dark {
      --bg: hsl(79, 19.5%, 12%);
      --card: hsl(79, 19.5%, 15%);
      --text: hsl(79, 20%, 98%);
      --sidebar: hsl(79, 19.5%, 15%);
      --border: hsl(79, 19.5%, 25%);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: 'Cairo', sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      height: 100vh;
      overflow: hidden; /* Empêche le double scrollbar */
    }

    /* ===== SIDEBAR ===== */
    aside {
      width: 280px;
      background: var(--sidebar);
      color: #fff;
      padding: 20px;
      overflow-y: auto;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    aside h2 {
      margin-top: 0;
      font-size: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 15px;
      margin-bottom: 15px;
    }

    aside a {
      display: block;
      padding: 10px 12px;
      color: hsl(79, 19.5%, 70%);
      text-decoration: none;
      border-radius: 6px;
      margin-bottom: 5px;
      font-size: 15px;
    }

    aside a:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    /* ===== MAIN ===== */
    main {
      flex: 1;
      padding: 25px;
      overflow-y: auto;
      scroll-behavior: smooth;
    }

    .topbar {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bg);
      padding-bottom: 10px;
    }

    input {
      flex: 1;
      padding: 12px 15px;
      border-radius: 10px;
      border: 1px solid var(--border);
      font-family: 'Cairo';
      font-size: 16px;
      background: var(--card);
      color: var(--text);
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    button {
      padding: 10px 18px;
      border: none;
      border-radius: 10px;
      background: var(--accent);
      color: white;
      cursor: pointer;
      font-family: 'Cairo';
      font-weight: 700;
      transition: background 0.2s;
    }
    
    button:hover {
      background: #b5952f;
    }

    /* ===== CARD ===== */
    .card {
      background: var(--card);
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--border);
      overflow: hidden;
    }

    /* ===== ACCORDION ===== */
    details {
      width: 100%;
    }

    summary {
      padding: 18px 24px;
      font-weight: 700;
      cursor: pointer;
      font-size: 19px;
      background: rgba(0, 0, 0, 0.02);
      border-bottom: 1px solid transparent;
      list-style: none; /* Cache la flèche par défaut sur certains navigateurs */
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.2s;
    }
    
    body.dark summary {
       background: rgba(255, 255, 255, 0.03);
    }

    summary:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    
    details[open] summary {
      border-bottom-color: var(--border);
      background: rgba(212, 175, 55, 0.15);
      color: var(--accent);
    }

    /* Flèche personnalisée */
    summary::after {
      content: '+';
      font-size: 24px;
      font-weight: 300;
      transform: rotate(0deg);
      transition: transform 0.2s;
    }

    details[open] summary::after {
      transform: rotate(45deg); 
    }

    .content {
      padding: 24px;
      line-height: 2.2;
      font-size: 16px;
    }

    /* Styles du contenu original */
    .content p { margin: 12px 0; }
    .content strong { color: var(--accent); }
    body.dark .content strong { color: #e6c863; } /* Bleu plus clair en mode sombre */
    
    .content ul, .content ol {
      padding-right: 25px;
      margin: 10px 0;
    }
    
    .content li {
      margin-bottom: 8px;
    }
    
    .table-container, .table-wrap {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 12px;
      text-align: right;
    }
    th {
      background: rgba(0,0,0,0.05);
      color: var(--text);
    }
    body.dark th {
      background: rgba(255,255,255,0.05);
    }

    @media(max-width: 900px) {
      body { flex-direction: column; height: auto; overflow: visible;}
      aside { width: 100%; height: auto; overflow: visible;}
      main { padding: 15px; }
      .topbar { position: static; }
    }
  </style>
</head>
"""

bottom_script = """
  </main>

  <script>
    const THEME_KEY = "theme";

    function searchText(value) {
      const filter = value.toLowerCase();
      const cards = document.querySelectorAll(".card");
      cards.forEach(c => {
        const text = c.innerText.toLowerCase();
        if (text.includes(filter)) {
          c.style.display = 'block';
          // Optionnel: Ouvrir automatiquement les détails si on cherche des mots à l'intérieur
          if (value.length > 2) {
            const detail = c.querySelector('details');
            if (detail) detail.open = true;
          }
        } else {
          c.style.display = 'none';
        }
      });
    }

    function toggleDark() {
      const current = getTheme();
      const next = current === "dark" ? "light" : "dark";
      setTheme(next);
    }

    function getTheme() {
      try {
        const stored = localStorage.getItem(THEME_KEY);
        return stored === "light" ? "light" : "dark";
      } catch {
        return "dark";
      }
    }

    function applyTheme(theme) {
      document.body.classList.toggle("dark", theme === "dark");
    }

    function setTheme(theme) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {}
      applyTheme(theme);
    }

    (function initTheme() {
      const theme = getTheme();
      // Persist default so other pages can sync.
      try {
        if (!localStorage.getItem(THEME_KEY)) localStorage.setItem(THEME_KEY, theme);
      } catch {}
      applyTheme(theme);

      window.addEventListener("storage", (e) => {
        if (e.key === THEME_KEY) applyTheme(getTheme());
      });
    })();
  </script>

</body>

</html>
"""

def extract_nav(html):
    nav_match = re.search(r'<nav>(.*?)</nav>', html, re.DOTALL)
    if nav_match:
        links = re.findall(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', nav_match.group(1))
        return links
    return []

emojis = ['📌', '🗺️', '📏', '⚙️', '🛡️', '⚔️', '📡', '🚁', '🎖️', '⚓', '🚩', '🏆', '🎯', '🚀']

def process_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()
        
    global_page_title = "بدون عنوان"
    h1_match = re.search(r'<h1>(.*?)</h1>', html)
    if h1_match:
        global_page_title = h1_match.group(1).strip()

    links = extract_nav(html)

    new_body = '<body class="dark">\n\n  <!-- ===== SIDEBAR ===== -->\n  <aside>\n'
    new_body += '    <a href="/viewer/dep12" style="background: rgba(255,255,255,0.1); text-align: center; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.2);">\n'
    new_body += '      🏠 العودة للقائمة الرئيسية\n    </a>\n\n'
    new_body += '    <h2>📚 الفهرس</h2>\n'
    
    if len(links) == 0:
        new_body += f'    <a href="#part1">1. {global_page_title}</a>\n'
    else:
        for href, text in links:
            text = re.sub(r'<[^>]+>', '', text).strip()
            new_body += f'    <a href="{href}">{text}</a>\n'
    
    new_body += '  </aside>\n\n  <!-- ===== MAIN ===== -->\n  <main>\n\n'
    new_body += '    <div class="topbar">\n      <input type="text" placeholder="ابحث في المحتوى..." onkeyup="searchText(this.value)">\n      <button onclick="toggleDark()">🌙 / ☀️</button>\n    </div>\n\n'

    sections_split = html.split('<section')
    
    idx = 0
    for i, s in enumerate(sections_split[1:]):
        s = '<section' + s
        
        id_match = re.search(r'id="([^"]+)"', s)
        section_id = id_match.group(1) if id_match else f"part{idx+1}"
        
        title_block_match = re.search(r'<h3 class="section-title">(.*?)</h3>', s, re.DOTALL)
        
        if title_block_match:
            title_html = title_block_match.group(1)
            num_match = re.search(r'<span[^>]*class="section-number"[^>]*>(.*?)</span>', title_html)
            num = num_match.group(1).strip() if num_match else str(idx+1)
            
            rest_html = re.sub(r'<span[^>]*class="section-number"[^>]*>.*?</span>', '', title_html)
            rest_html = re.sub(r'<span[^>]*class="collapse-icon"[^>]*>.*?</span>', '', rest_html)
            rest_text = re.sub(r'<[^>]+>', '', rest_html).strip()
            
            title_text = f"{num} ـ {rest_text}"
        else:
            title_text = f"1 ـ {global_page_title}"
            
        # Try finding content block
        content_match = re.search(r'<div class="content-block[^"]*">(.*?)(?:</section>|$)', s, re.DOTALL)
        if not content_match:
            # Maybe just grab everything inside section
            inner = re.search(r'<section[^>]*>(.*?)</section>', s, re.DOTALL)
            content_html = inner.group(1) if inner else ""
        else:
            content_html = content_match.group(1)
        
        emoji = emojis[idx % len(emojis)]
        
        new_body += f'    <!-- ===== SECTION {idx+1} ===== -->\n'
        new_body += f'    <div class="card" id="{section_id}">\n'
        new_body += f'      <details {"open"}>\n'
        new_body += f'        <summary>{emoji} {title_text}</summary>\n'
        new_body += f'        <div class="content">\n'
        new_body += f'{content_html}\n'
        new_body += f'        </div>\n'
        new_body += f'      </details>\n'
        new_body += f'    </div>\n\n'
        
        idx += 1
        
    final_output = style_and_head + new_body + bottom_script
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(final_output)
    print(f"Refactored {file_path}")

process_file("public/uploads/docs/dep12_section1.html")
process_file("public/uploads/docs/dep12_section2.html")
process_file("public/uploads/docs/dep12_section3.html")
