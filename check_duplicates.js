
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'web/prisma/dep13_data.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const termMap = new Map();

data.forEach((section) => {
    section.terms.forEach((item) => {
        const term = item.term.trim();
        if (!termMap.has(term)) {
            termMap.set(term, []);
        }
        termMap.get(term).push({
            section: section.section.number,
            imageUrl: item.imageUrl
        });
    });
});

console.log("Checking for duplicates...");
let count = 0;
termMap.forEach((occurrences, term) => {
    if (occurrences.length > 1) {
        console.log(`Duplicate found: "${term}"`);
        occurrences.forEach(occ => {
            console.log(`  - Section ${occ.section}, Image: ${occ.imageUrl}`);
        });
        count++;
    }
});

if (count === 0) {
    console.log("No duplicates found.");
} else {
    console.log(`\nFound ${count} duplicate terms.`);
}
