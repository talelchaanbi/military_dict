const fs = require('fs');
const file = 'src/components/terms/TermsTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\$\{selectedRows\.map\(row => \\`([\s\S]*?)\\`\)\.join\(''\)\}/;
// Replace with proper unescaped template string
content = content.replace(
  /\$\{selectedRows\.map\(row => \\`([\s\S]*?)\\`\)\.join\(''\)\}/g,
  (match) => match.replace(/\\`/g, '`').replace(/\\\$/g, '$')
);

fs.writeFileSync(file, content);
