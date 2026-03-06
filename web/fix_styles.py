import re
import glob
import os

# We will check if we are in 'web' or root
base_dir = '.'
if os.path.exists('public/uploads/docs'):
    base_dir = '.'
elif os.path.exists('web/public/uploads/docs'):
    base_dir = 'web'

files = glob.glob(f'{base_dir}/public/uploads/docs/dep12_*.html')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update text-align for table cells
    html = re.sub(r'th,\s*td\s*\{\s*border:\s*1px\s*solid\s*var\(--border\);\s*padding:\s*12px;\s*text-align:\s*right;\s*\}', 
                  'th, td {\n      border: 1px solid var(--border);\n      padding: 12px;\n      text-align: center;\n      vertical-align: middle;\n    }', html)
    
    # 2. Add image CSS and lightbox CSS right before </style>
    if '/* Lightbox style */' not in html:
        img_css = """
    /* Image and Lightbox styles */
    .content img {
      height: 150px !important;
      width: auto !important;
      max-width: 100% !important;
      object-fit: contain;
      cursor: zoom-in;
      transition: transform 0.2s;
      background: white;
      padding: 5px;
      border: 1px solid var(--border);
      border-radius: 8px;
      display: inline-block;
      margin: 10px;
    }
    .content img:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    #lightbox {
      display: none;
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      cursor: zoom-out;
    }
    #lightbox img {
      height: 500px !important;
      width: auto !important;
      max-width: 90vw !important;
      object-fit: contain;
      background: white;
      padding: 15px;
      border-radius: 12px;
      margin: 0 !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    """
        html = html.replace('</style>', img_css + '\n  </style>')

    # 3. Add lightbox HTML and JS right before </body>
    if 'id="lightbox"' not in html:
        lightbox_js = """
  <div id="lightbox" onclick="this.style.display='none'">
    <img id="lightbox-img" src="" alt="zoom">
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.content img').forEach(img => {
        img.onclick = function(e) {
          e.stopPropagation(); // Prevent triggering other clicks
          const lb = document.getElementById('lightbox');
          const lbImg = document.getElementById('lightbox-img');
          lbImg.src = this.src;
          lb.style.display = 'flex';
        };
      });
    });
  </script>
"""
        html = html.replace('</body>', lightbox_js + '\n</body>')

    # 4. Remove 'max-width' and 'style' attributes from inline img tags to ensure CSS overrides work perfectly
    html = re.sub(r'<img([^>]*?)\s+style="[^"]*"([^>]*)>', r'<img\1\2>', html)
    html = re.sub(r'<img([^>]*?)\s+width="[^"]*"([^>]*)>', r'<img\1\2>', html)
    html = re.sub(r'<img([^>]*?)\s+height="[^"]*"([^>]*)>', r'<img\1\2>', html)
    html = re.sub(r'<img([^>]*?)\s+style=\'[^\']*\'([^>]*)>', r'<img\1\2>', html)

    # 5. Only first details should be open
    parts = re.split(r'<details(?:\s+open)?>', html)
    if len(parts) > 1:
        new_html = parts[0]
        for i in range(1, len(parts)):
            if i == 1:
                new_html += '<details open>' + parts[i]
            else:
                new_html += '<details>' + parts[i]
        html = new_html

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
        print(f"Fixed {filepath}")

