import re

with open('src/components/terms/TermsTableClient.tsx', 'r') as f:
    text = f.read()

# I want to add `selectAll` and `clearSelection` logic

select_all_funcs = """
  const selectAll = () => {
    let allIds: number[] = [];
    if (canGroup) {
      groupedTerms.forEach((g: any) => {
        g.terms.forEach((t: any) => allIds.push(t.id));
      });
    } else {
      allIds = terms.map((t: any) => t.id);
    }
    setSelectedIds(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };
"""

text = text.replace('const handleExportCsv', select_all_funcs + '\n  const handleExportCsv')

# I also want to add buttons for these. Currently there's:
# {(selectedIds.size > 0) && (

ui_buttons = """
       <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/40 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
             <button onClick={selectAll} className="text-sm px-3 py-1.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium">تحديد الكل</button>
             <button onClick={clearSelection} className="text-sm px-3 py-1.5 rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium disabled:opacity-50" disabled={selectedIds.size === 0}>إلغاء التحديد</button>
             {selectedIds.size > 0 && <span className="text-sm font-semibold text-primary px-2">{selectedIds.size} عنصر محدد</span>}
          </div>
          <button onClick={handleExportCsv} disabled={selectedIds.size === 0} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none transition-all">
             <Download className="w-4 h-4" /> تصدير CSV
          </button>
       </div>
"""

# Replace the existing export UI
text = re.sub(
    r'\{\(selectedIds\.size > 0\) && \(\s*<div className="flex items-center justify-between bg-primary/10.*?</div>\s*\)\}',
    ui_buttons,
    text,
    flags=re.DOTALL
)

with open('src/components/terms/TermsTableClient.tsx', 'w') as f:
    f.write(text)

