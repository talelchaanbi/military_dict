const fs = require('fs');
const file = 'src/components/terms/TermsTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `                <div className="px-4 py-3 bg-muted/40 flex justify-between items-center">
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
                    className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-background border hover:bg-accent text-secondary-foreground"
                  >
                    {group.terms.length > 0 && group.terms.every((t: any) => selectedMap[t.id]) ? (
                      <><CheckSquare className="w-4 h-4 text-primary" /> الغاء التحديد</>
                    ) : (
                      <><Square className="w-4 h-4 text-muted-foreground" /> تحديد هذه المجموعة</>
                    )}
                  </button>
                </div>`;

content = content.replace(/<div className="px-4 py-3 bg-muted\/40">\s*\{group\.subTitle && group\.parentTitle \? \([\s\S]*?\)\s*\}[\s\S]*?<\/div>/m, replacement);

fs.writeFileSync(file, content);
