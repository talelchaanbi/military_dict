import re
import glob

for filepath in glob.glob('public/uploads/docs/dep12_*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Clean double injected CSS
    html = re.sub(r'(/\* Image and Lightbox styles \*/.*?)(/\* Image and Lightbox styles \*/.*?</style>)', r'\2', html, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
