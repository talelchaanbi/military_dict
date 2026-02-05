/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");
const { load } = require("cheerio");

function norm(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim();
}

function main() {
  const input = process.argv[2];
  const tableIndex = Number.parseInt(process.argv[3] || "0", 10);
  const maxRows = Number.parseInt(process.argv[4] || "12", 10);

  if (!input || !Number.isFinite(tableIndex) || tableIndex < 0) {
    console.error(
      "Usage: node scripts/inspect-generated-table.cjs path/to/doc.html <tableIndex> [maxRows]"
    );
    process.exitCode = 2;
    return;
  }

  const abs = path.resolve(process.cwd(), input);
  const html = fs.readFileSync(abs, "utf8");
  const $ = load(html, {}, false);

  const tables = $("table").toArray();
  const table = tables[tableIndex];
  if (!table) {
    console.error(`No table at index ${tableIndex}; tables=${tables.length}`);
    process.exitCode = 3;
    return;
  }

  const rows = $(table).find("tr").toArray();
  console.log(`tables=${tables.length} table=${tableIndex} rows=${rows.length}`);
  if (rows[0]) console.log("header:", norm($(rows[0]).text()).slice(0, 260));

  for (let i = 1; i < Math.min(rows.length, maxRows); i++) {
    const tr = rows[i];
    console.log(
      `row ${i} imgs=${$(tr).find("img").length} :: ${norm($(tr).text()).slice(0, 260)}`
    );
  }
}

main();
