const fs = require('fs');
const file = 'src/components/terms/TermsTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{renderRow\(t, group\?\.title \|\| ""\)\}/g, (match, offset) => {
    // Only replace if it's in the terms.map section
    return match;
});

// Since I want to replace the SECOND ONE:
const parts = content.split('renderRow(t, group?.title || "")');
if (parts.length > 2) {
   content = parts[0] + 'renderRow(t, group?.title || "")' + parts[1] + 'renderRow(t, "")' + parts[2];
}

fs.writeFileSync(file, content);
