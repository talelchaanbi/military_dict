const fs = require('fs');
const file = 'src/components/terms/TermsTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Make the top bar sticky
content = content.replace(
  /<div className="flex flex-wrap items-center justify-between gap-4 bg-muted\/40 p-4 rounded-lg border">/,
  '<div className="flex flex-wrap items-center justify-between gap-4 bg-background/95 backdrop-blur shadow-sm p-4 rounded-lg border sticky top-2 z-40 my-2">'
);

// 2. Fix the button styling and text
const oldBtn = /<button\s+onClick=\{\(\) => toggleGroupSelection\(group\)\}\s+className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-background border hover:bg-accent text-secondary-foreground transition-colors"\s*>([\s\S]*?)<\/button>/m;

const newBtn = `<button
                    onClick={() => toggleGroupSelection(group)}
                    className="flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-md bg-background border border-border shadow-sm hover:bg-accent hover:text-accent-foreground font-medium transition-all"
                  >
                    {group.terms.length > 0 && group.terms.every((t: any) => selectedMap[t.id]) ? (
                      <><CheckSquare className="w-4 h-4 text-primary" /> الغاء تحديد المجموعة</>
                    ) : (
                      <><Square className="w-4 h-4 text-muted-foreground" /> تحديد هذه المجموعة</>
                    )}
                  </button>`;

content = content.replace(oldBtn, newBtn);

fs.writeFileSync(file, content);
