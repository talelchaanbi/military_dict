
const fs = require('fs');
const path = require('path');

// Adjusted path assuming we run this from web/ directory
const filePath = path.join(process.cwd(), 'prisma/dep13_data.json');

try {
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
    let duplicateCount = 0;
    
    // Sort keys alphabetically for easier reading
    const sortedTerms = Array.from(termMap.keys()).sort();

    sortedTerms.forEach(term => {
        const occurrences = termMap.get(term);
        if (occurrences.length > 1) {
            console.log(`Duplicate found: "${term}"`);
            occurrences.forEach(occ => {
                console.log(`  - Section ${occ.section}, Image: ${occ.imageUrl}`);
            });
            console.log("----");
            duplicateCount++;
        }
    });

    if (duplicateCount === 0) {
        console.log("No duplicates found.");
    } else {
        console.log(`\nFound ${duplicateCount} duplicate terms.`);
    }

} catch (error) {
    console.error("Error reading file:", error.message);
}
