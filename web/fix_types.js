const fs = require('fs');
const file = 'src/components/terms/TermsTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/groupedTerms\.forEach\(\(g\) => \{/g, 'groupedTerms.forEach((g: any) => {');
content = content.replace(/g\.terms\.filter\(\(t\) =>/g, 'g.terms.filter((t: any) =>');
content = content.replace(/terms\.filter\(\(t\) =>/g, 'terms.filter((t: any) =>');
content = content.replace(/printGroups\.map\(group =>/g, 'printGroups.map((group: any) =>');
content = content.replace(/group\.terms\.map\(row =>/g, 'group.terms.map((row: any) =>');

fs.writeFileSync(file, content);
