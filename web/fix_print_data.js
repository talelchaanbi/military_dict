const fs = require('fs');
const file = 'src/components/terms/TermsTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ Group items for printing[\s\S]*?const printWindow = window\.open/m;

const replacement = `    // Group items from all selections across searches
    let printGroups: any[] = [];
    const allSelected = Object.values(selectedMap);
    
    if (canGroup) {
      const groupsMap = new Map<string, any[]>();
      allSelected.forEach((t: any) => {
        const gTitle = t._groupTitle || "";
        if (!groupsMap.has(gTitle)) {
          groupsMap.set(gTitle, []);
        }
        groupsMap.get(gTitle)?.push(t);
      });
      
      groupsMap.forEach((terms, title) => {
        printGroups.push({ title, terms });
      });
    } else {
      printGroups.push({
        title: "",
        terms: allSelected
      });
    }

    const printWindow = window.open`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
