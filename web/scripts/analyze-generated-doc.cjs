/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");
const { load } = require("cheerio");

function textOf($, el) {
  return $(el)
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

function findHeaderIndex($, tr, needle) {
  const cells = $(tr).children("th,td").toArray();
  for (let i = 0; i < cells.length; i++) {
    const t = textOf($, cells[i]);
    if (!t) continue;
    if (t === needle) return i;
    if (t.includes(needle)) return i;
  }
  return null;
}

function isLikelySerialCellText(t) {
  if (!t) return false;
  const compact = t.replace(/\s+/g, "");
  return /^\d+$/.test(compact);
}

function main() {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: node scripts/analyze-generated-doc.cjs path/to/depXX.html");
    process.exitCode = 2;
    return;
  }

  const abs = path.resolve(process.cwd(), input);
  const html = fs.readFileSync(abs, "utf8");
  const $ = load(html, {}, false);

  const anomalies = [];

  $("table").each((tableIndex, table) => {
    const rows = $(table).find("tr").toArray();
    if (rows.length < 2) return;

    // Find a header row that contains "الرمز".
    let headerRow = null;
    let symbolIndex = null;
    let meaningIndex = null;
    for (let i = 0; i < Math.min(rows.length, 4); i++) {
      const tr = rows[i];
      const si = findHeaderIndex($, tr, "الرمز");
      if (si === null) continue;
      headerRow = tr;
      symbolIndex = si;
      meaningIndex = findHeaderIndex($, tr, "معنى");
      break;
    }
    if (!headerRow || symbolIndex === null) return;

    // Scan data rows.
    for (let r = 1; r < rows.length; r++) {
      const tr = rows[r];
      const cells = $(tr).children("th,td").toArray();
      if (cells.length === 0) continue;

      const firstText = textOf($, cells[0]);
      if (!isLikelySerialCellText(firstText)) continue;

      const symCell = cells[symbolIndex] || null;
      if (!symCell) {
        anomalies.push({
          tableIndex,
          rowIndex: r,
          serial: firstText,
          type: "missing-symbol-column",
          rowText: textOf($, tr).slice(0, 180),
        });
        continue;
      }

      const symText = textOf($, symCell);
      const symImgs = $(symCell).find("img").length;
      const symRowspan = $(symCell).attr("rowspan") || "";
      const symColspan = $(symCell).attr("colspan") || "";

      // Empty symbol cell (no img, no text) but row has content.
      const rowText = textOf($, tr);
      const meaningCell = meaningIndex !== null ? cells[meaningIndex] : null;
      const meaningText = meaningCell ? textOf($, meaningCell) : "";

      if (symImgs === 0 && !symText && (meaningText || rowText.length > firstText.length)) {
        anomalies.push({
          tableIndex,
          rowIndex: r,
          serial: firstText,
          type: "empty-symbol-cell",
          info: `rowspan=${symRowspan || 1} colspan=${symColspan || 1}`,
          meaning: meaningText.slice(0, 120),
        });
      }

      // Suspicious: symbol cell has huge rowspan.
      if (symRowspan && Number(symRowspan) >= 3) {
        anomalies.push({
          tableIndex,
          rowIndex: r,
          serial: firstText,
          type: "large-symbol-rowspan",
          info: `rowspan=${symRowspan}`,
          meaning: meaningText.slice(0, 120),
        });
      }
    }
  });

  console.log(`tables=${$("table").length} anomalies=${anomalies.length}`);
  for (const a of anomalies.slice(0, 80)) {
    console.log(
      `t${a.tableIndex} r${a.rowIndex} #${a.serial} ${a.type}` +
        (a.info ? ` (${a.info})` : "") +
        (a.meaning ? ` :: ${a.meaning}` : "")
    );
  }
  if (anomalies.length > 80) console.log(`... +${anomalies.length - 80} more`);
}

main();
