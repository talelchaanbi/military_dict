import re

with open('src/components/terms/TermsTableClient.tsx', 'r') as f:
    text = f.read()

# Let's remove everything that looks like:
# const selectAll = ...
# ...
#   const clearSelection = () => { ... }

pattern = r'\s*const selectAll = \(\) => \{.*?\};\s*'
text = re.sub(pattern, '\n', text, flags=re.DOTALL)

pattern = r'\s*const clearSelection = \(\) => \{.*?\};\s*'
text = re.sub(pattern, '\n', text, flags=re.DOTALL)

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

with open('src/components/terms/TermsTableClient.tsx', 'w') as f:
    f.write(text)
