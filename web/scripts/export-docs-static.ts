import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { load } from "cheerio";

type AnyNode = any;

import { injectImagesIntoSymbolTables } from "../src/lib/docHtml.server";
import { convertDocxFileToHtml, publicPathToAbsDocxPath } from "../src/lib/docxToHtml";

// Node 18 does not provide a global `File`, but some transitive deps (via undici)
// assume it's present. Provide a minimal polyfill so scripts can run.
if (typeof (globalThis as any).File === "undefined") {
  class FilePolyfill extends Blob {
    name: string;
    lastModified: number;
    webkitRelativePath = "";

    constructor(
      fileBits: Array<BlobPart>,
      fileName: string,
      options?: FilePropertyBag & { lastModified?: number }
    ) {
      super(fileBits, options);
      this.name = String(fileName);
      this.lastModified = options?.lastModified ?? Date.now();
    }
  }
  (globalThis as any).File = FilePolyfill;
}

function wrapTablesForResponsive(html: string): string {
  if (!html) return "";
  return html
    .replace(/<table\b[^>]*>/gi, (m) => `<div class="table-wrap">${m}`)
    .replace(/<\/table>/gi, "</table></div>");
}

function mkdirp(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function storedHtmlHasEmptySymbolCells(html: string): boolean {
  if (!html) return false;

  try {
    const $ = load(html, {}, false);

    function cellText(el: AnyNode): string {
      return $(el)
        .text()
        .replace(/\s+/g, " ")
        .trim();
    }

    function colspan(el: AnyNode): number {
      const raw = $(el).attr("colspan");
      const n = raw ? Number.parseInt(String(raw), 10) : 1;
      return Number.isFinite(n) && n > 0 ? n : 1;
    }

    function findLogicalColumnIndexForHeaderRow(row: AnyNode, needle: string): number | null {
      const cells = $(row).children("th,td").toArray();
      let logicalIndex = 0;
      for (const cell of cells) {
        const span = colspan(cell);
        const text = cellText(cell);
        if (text.includes(needle)) return logicalIndex;
        logicalIndex += span;
      }
      return null;
    }

    function findCellAtLogicalIndex(row: AnyNode, targetIndex: number): AnyNode | null {
      const cells = $(row).children("th,td").toArray();
      let logicalIndex = 0;
      for (const cell of cells) {
        const span = colspan(cell);
        if (targetIndex >= logicalIndex && targetIndex < logicalIndex + span) return cell;
        logicalIndex += span;
      }
      return null;
    }

    for (const table of $("table").toArray()) {
      const rows = $(table).find("tr").toArray();
      if (rows.length < 2) continue;

      const symbolLogicalIndex = findLogicalColumnIndexForHeaderRow(rows[0], "الرمز");
      if (symbolLogicalIndex === null) continue;

      for (let i = 1; i < rows.length; i++) {
        const cell = findCellAtLogicalIndex(rows[i], symbolLogicalIndex);
        if (!cell) continue;
        const hasImg = $(cell).find("img").length > 0;
        const hasText = cellText(cell).length > 0;
        if (!hasImg && !hasText) return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function buildHtmlPage(params: {
  title: string;
  contentHtml: string;
  images: Array<{ url: string; caption?: string }>;
}) {
  const { title, contentHtml, images } = params;

  const styles = `
    body { font-family: Arial, Helvetica, sans-serif; direction: rtl; margin: 0; background: #f4f4f5; color: #111827; }
    header { background: #fff; border-bottom: 1px solid #e4e4e7; padding: 16px; }
    main { max-width: 1100px; margin: 0 auto; padding: 20px 16px; }
    .card { background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; }
    .doc-content { line-height: 1.9; font-size: 16px; direction: rtl; text-align: right; }
    .doc-content h1, .doc-content h2, .doc-content h3 { margin: 16px 0 8px; }
    .doc-content p { margin: 8px 0; }
    .doc-content img { max-width: 100%; height: auto; }
    .doc-content img.doc-inline-asset { display: block; margin: 0 auto; max-width: 140px; max-height: 90px; object-fit: contain; }
    .doc-content .table-wrap { margin: 12px 0; overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid #e4e4e7; border-radius: 12px; background: #fff; }
    .doc-content table { border-collapse: collapse; margin: 0; min-width: 100%; width: max-content; }
    .doc-content th, .doc-content td { border: 1px solid #e4e4e7; padding: 8px 10px; vertical-align: top; white-space: normal; word-break: break-word; }
    .doc-content th { background: #fafafa; font-weight: 700; }
    .doc-content tr:nth-child(even) td { background: #fafafa; }
    .doc-content table p { margin: 4px 0; }
    .doc-content table strong { font-weight: 600; }
    .images { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
    .img { border: 1px solid #e4e4e7; border-radius: 10px; overflow: hidden; background: #fff; }
    .img img { display: block; width: 100%; height: auto; }
    .cap { font-size: 12px; color: #6b7280; padding: 8px 10px; }
    details { margin-top: 16px; }
    summary { cursor: pointer; font-weight: 700; font-size: 14px; }
    a { color: inherit; }
  `;

  const imgs = images
    .map(
      (i) => `
      <div class="img">
        <img src="${i.url}" alt="" />
        ${i.caption ? `<div class="cap">${i.caption}</div>` : ""}
      </div>
    `
    )
    .join("\n");

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>${styles}</style>
</head>
<body>
  <header>
    <strong>${title}</strong>
  </header>
  <main>
    <div class="card">
      <div class="doc-content">${wrapTablesForResponsive(contentHtml || "")}</div>
      ${
        images.length
          ? `<details open><summary>الصور (اضغط للإخفاء)</summary><div class="images">${imgs}</div></details>`
          : ""
      }
    </div>
  </main>
</body>
</html>`;
}

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const repoRoot = path.join(__dirname, "..", "..");
  const outDir = path.join(repoRoot, "web", "public", "generated", "docs");
  mkdirp(outDir);

  const docs = await prisma.document.findMany({
    orderBy: [{ sectionId: "asc" }, { code: "asc" }],
    select: {
      code: true,
      title: true,
      contentHtml: true,
      variants: {
        orderBy: { format: "asc" },
        select: { format: true, sourcePath: true, mimeType: true },
      },
      assets: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: {
          order: true,
          asset: { select: { sha256: true, path: true, isLogo: true } },
        },
      },
    },
  });

  for (const doc of docs) {
    const storedHtml = doc.contentHtml || "";
    const storedHasImg = /<img\b/i.test(storedHtml);
    const docxVariant = doc.variants.find((v) =>
      v.sourcePath?.toLowerCase().endsWith(".docx")
    );

    let contentHtml = storedHtml;
    let remainingImages: Array<{ url: string; caption?: string }> = [];

    const images = doc.assets
      .filter((a) => !a.asset.isLogo)
      .map((a) => ({
        sha256: a.asset.sha256,
        url: a.asset.path,
        caption: a.order !== null && a.order !== undefined ? `صفحة ${a.order}` : undefined,
      }));

    // If stored HTML has no images and a DOCX variant exists, export from DOCX instead.
    // This preserves true placement of images in tables and paragraphs.
    const storedNeedsDocx = storedHtmlHasEmptySymbolCells(storedHtml);
    if ((!storedHasImg || storedNeedsDocx) && docxVariant) {
      try {
        const absDocxPath = publicPathToAbsDocxPath(
          path.join(repoRoot, "web"),
          docxVariant.sourcePath
        );
        contentHtml = await convertDocxFileToHtml(absDocxPath);
        remainingImages = [];
      } catch {
        contentHtml = storedHtml;
      }
    }

    if (contentHtml === storedHtml) {
      const { html: htmlWithInline, usedSha256 } = injectImagesIntoSymbolTables(
        storedHtml,
        images.map((i) => ({ url: i.url, sha256: i.sha256 }))
      );

      contentHtml = htmlWithInline;
      remainingImages = images
        .filter((i) => !usedSha256.has(i.sha256))
        .map(({ url, caption }) => ({ url, caption }));
    }

    const html = buildHtmlPage({
      title: doc.title || doc.code,
      contentHtml,
      images: remainingImages,
    });

    const outPath = path.join(outDir, `${doc.code}.html`);
    fs.writeFileSync(outPath, html, "utf8");
    console.log(`Wrote ${outPath}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
