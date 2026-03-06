const fs = require('fs');
const file = 'src/components/terms/TermsTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// I will find the whole block from <div className="group-section to <div className="overflow-x-auto">
// and replace the inner header.

const startRegex = /<div className="group-section[^>]+>[\s\S]*?<div className="overflow-x-auto">/g;

content = content.replace(startRegex, (match) => {
  // Let's replace the whole top div correctly!
  return `<div className="group-section scroll-mt-24 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-muted/40 flex justify-between items-center">
                  <div>
                    {group.subTitle && group.parentTitle ? (
                      <div className="space-y-1">
                        {(idx === 0 || groupedTerms[idx - 1]?.parentTitle !== group.parentTitle) && (
                          <div className="text-xs font-semibold text-muted-foreground">{group.parentTitle}</div>
                        )}
                        <div className="text-sm font-semibold">{group.title}</div>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold">{group.title}</div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleGroupSelection(group)}
                    className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-background border hover:bg-accent text-secondary-foreground transition-colors"
                  >
                    {group.terms.length > 0 && group.terms.every((t: any) => selectedMap[t.id]) ? (
                      <><CheckSquare className="w-4 h-4 text-primary" /> الغاء التحديد</>
                    ) : (
                      <><Square className="w-4 h-4 text-muted-foreground" /> تحديد هذه المجموعة</>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto">`;
});

fs.writeFileSync(file, content);
