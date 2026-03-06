const fs = require('fs');
const file = 'src/components/terms/TermsTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace state
content = content.replace(
  /const \[selectedIds, setSelectedIds\] = useState<Set<number>>\(new Set\(\)\);/,
  `const [selectedMap, setSelectedMap] = useState<Record<number, any>>({});
  const selectedCount = Object.keys(selectedMap).length;`
);

// 2. Replace toggleSelection
content = content.replace(
  /const toggleSelection = \(id: number\) => \{[\s\S]*?return newSet;\n    \}\);\n  \};/,
  `const toggleSelection = (t: any, groupTitle: string = "") => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[t.id]) {
        delete next[t.id];
      } else {
        next[t.id] = { ...t, _groupTitle: groupTitle };
      }
      return next;
    });
  };

  const toggleGroupSelection = (group: any) => {
    const allSelected = group.terms.length > 0 && group.terms.every((t: any) => selectedMap[t.id]);
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (allSelected) {
        group.terms.forEach((t: any) => { delete next[t.id]; });
      } else {
        group.terms.forEach((t: any) => { next[t.id] = { ...t, _groupTitle: group.title }; });
      }
      return next;
    });
  };`
);

// 3. Replace selectAll
content = content.replace(
  /const selectAll = \(\) => \{[\s\S]*?setSelectedIds\(new Set\(allIds\)\);\n  \};/,
  `const selectAll = () => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (canGroup) {
        groupedTerms.forEach((g: any) => {
          g.terms.forEach((t: any) => { next[t.id] = { ...t, _groupTitle: g.title }; });
        });
      } else {
        terms.forEach((t: any) => { next[t.id] = { ...t, _groupTitle: "" }; });
      }
      return next;
    });
  };`
);

// 4. Replace clearSelection
content = content.replace(
  /const clearSelection = \(\) => \{\n    setSelectedIds\(new Set\(\)\);\n  \};/,
  `const clearSelection = () => {
    setSelectedMap({});
  };`
);

// 5. Replace handleExportCsv part until headers
content = content.replace(
  /const handleExportCsv = \(\) => \{\n    if \(selectedIds\.size === 0\) return;\n    \n    \/\/ gather selected rows\n    let allRowsToConsider: any\[\] = \[\];\n    if \(canGroup\) \{\n      groupedTerms\.forEach\(\(g: any\) => \{\n        allRowsToConsider\.push\(\.\.\.g\.terms\);\n      \}\);\n    \} else \{\n      allRowsToConsider = terms;\n    \}\n\n    const selectedRows = allRowsToConsider\.filter\(\(t: any\) => selectedIds\.has\(t\.id\)\);\n\n    \/\/ headers/,
  `const handleExportCsv = () => {
    const selectedRows = Object.values(selectedMap);
    if (selectedRows.length === 0) return;

    // headers`
);

// 6. Replace handlePrint part until printWindow
content = content.replace(
  /const handlePrint = \(\) => \{\n    if \(selectedIds\.size === 0\) return;\n\n    \/\/ Group items for printing\n    let printGroups: any\[\] = \[\];\n    \n    if \(canGroup\) \{\n      groupedTerms\.forEach\(\(g: any\) => \{\n        const selectedInGroup = g\.terms\.filter\(\(t: any\) => selectedIds\.has\(t\.id\)\);\n        if \(selectedInGroup\.length > 0\) \{\n          printGroups\.push\(\{\n            title: g\.title,\n            terms: selectedInGroup\n          \}\);\n        \}\n      \}\);\n    \} else \{\n      const selectedRows = terms\.filter\(\(t: any\) => selectedIds\.has\(t\.id\)\);\n      if \(selectedRows\.length > 0\) \{\n        printGroups\.push\(\{\n          title: "", \/\/ No subtitle\n          terms: selectedRows\n        \}\);\n      \}\n    \}\n\n    const printWindow = window\.open/,
  `const handlePrint = () => {
    const selectedRows = Object.values(selectedMap);
    if (selectedRows.length === 0) return;

    // Group items for printing
    let printGroups: any[] = [];
    const groupedMap = new Map<string, any[]>();

    selectedRows.forEach((row: any) => {
        const title = row._groupTitle || "";
        if (!groupedMap.has(title)) {
            groupedMap.set(title, []);
        }
        groupedMap.get(title)!.push(row);
    });

    groupedMap.forEach((terms, title) => {
        printGroups.push({ title, terms });
    });

    const printWindow = window.open`
);

// 7. Replace selectedIds.size and selectedIds.has
content = content.replace(/selectedIds\.size === 0/g, 'selectedCount === 0');
content = content.replace(/selectedIds\.size > 0/g, 'selectedCount > 0');
content = content.replace(/\{selectedIds\.size\}/g, '{selectedCount}');
content = content.replace(/selectedIds\.has\(t\.id\)/g, '!!selectedMap[t.id]');

// 8. Replace renderRow declaration and logic
content = content.replace(
  /const renderRow = \(t: any\) => \{\n    const isSelected = !!selectedMap\[t\.id\];/,
  `const renderRow = (t: any, groupTitle: string = "") => {
    const isSelected = !!selectedMap[t.id];`
);
content = content.replace(/toggleSelection\(t\.id\)/g, 'toggleSelection(t, groupTitle)');
content = content.replace(/renderRow\(t\)/g, 'renderRow(t, group?.title || "")');

// 9. Inject toggleGroupSelection button in the group header
content = content.replace(
  /(\<div className="text-sm font-semibold">\{group\.title\}<\/div>\n\s*\}\)\n\s*<\/div>)/,
  `$1
                  <div className="px-4 pb-3 flex items-center bg-muted/40">
                    <button 
                      onClick={() => toggleGroupSelection(group)}
                      className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background hover:bg-muted border text-muted-foreground font-medium transition-colors"
                    >
                       {group.terms.length > 0 && group.terms.every((t: any) => selectedMap[t.id]) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                       تحديد هذه المجموعة ({group.terms.length})
                    </button>
                  </div>`
);

fs.writeFileSync(file, content);
