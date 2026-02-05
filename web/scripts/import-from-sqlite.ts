import "dotenv/config";

import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import * as mammoth from "mammoth";
import Database from "better-sqlite3";

import { PrismaClient } from "@prisma/client";

function assertTruthy<T>(value: T, message: string): NonNullable<T> {
  if (!value) throw new Error(message);
  return value as NonNullable<T>;
}

function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function sha256File(filePath: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function sha256Buffer(buffer: Buffer): string {
  const hash = crypto.createHash("sha256");
  hash.update(buffer);
  return hash.digest("hex");
}

function extFromContentType(contentType: string): string {
  const lower = contentType.toLowerCase();
  if (lower.includes("png")) return ".png";
  if (lower.includes("jpeg") || lower.includes("jpg")) return ".jpg";
  if (lower.includes("gif")) return ".gif";
  if (lower.includes("webp")) return ".webp";
  if (lower.includes("bmp")) return ".bmp";
  return ".png";
}

function mkdirp(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyIfNeeded(srcPath: string, destPath: string): void {
  if (fileExists(destPath)) return;
  mkdirp(path.dirname(destPath));
  fs.copyFileSync(srcPath, destPath);
}

function normalizeSectionType(sectionType: unknown): "terms" | "document" {
  if (sectionType === "document") return "document";
  return "terms";
}

function normalizeDocFormat(docType: unknown): "pdf" | "docx" | "doc" | null {
  if (!docType) return null;
  const normalized = String(docType).toLowerCase();
  if (normalized === "pdf") return "pdf";
  if (normalized === "docx") return "docx";
  if (normalized === "doc") return "doc";
  return null;
}

function mimeTypeForFormat(format: "pdf" | "docx" | "doc"): string {
  switch (format) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
  }
}

function resolveSourcePath(
  sourcePath: string | null | undefined,
  opts: { docsDir?: string; extractedDir?: string }
): string | null {
  if (!sourcePath) return null;

  const { docsDir, extractedDir } = opts;

  if (fileExists(sourcePath)) return sourcePath;

  // Rewrite stale absolute paths from another machine
  if (extractedDir) {
    const marker = `${path.sep}data${path.sep}extracted${path.sep}`;
    const index = sourcePath.lastIndexOf(marker);
    if (index !== -1) {
      const suffix = sourcePath.slice(index + marker.length);
      const candidate = path.join(extractedDir, suffix);
      if (fileExists(candidate)) return candidate;
    }
  }

  if (docsDir) {
    const marker = `${path.sep}qafFilesManager${path.sep}assets${path.sep}dep${path.sep}`;
    const index = sourcePath.lastIndexOf(marker);
    if (index !== -1) {
      const suffix = sourcePath.slice(index + marker.length);
      const candidate = path.join(docsDir, suffix);
      if (fileExists(candidate)) return candidate;
    }
  }

  const baseName = path.basename(sourcePath);

  if (docsDir) {
    const candidate = path.join(docsDir, baseName);
    if (fileExists(candidate)) return candidate;
  }

  if (extractedDir) {
    const candidate = path.join(extractedDir, baseName);
    if (fileExists(candidate)) return candidate;
  }

  return null;
}

type SqliteSectionRow = { number: number; title: string | null; type: string | null };

type SqliteTermRow = {
  sectionNumber: number;
  itemNumber: string | null;
  term: string | null;
  description: string | null;
  abbreviation: string | null;
};

type SqliteDocumentRow = {
  id: number;
  sectionNumber: number | null;
  sourcePath: string;
  title: string | null;
  docType: string;
  textContent: string | null;
};

type SqliteImageRow = {
  documentId: number;
  imagePath: string;
  width: number | null;
  height: number | null;
  page: number | null;
};

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.join(__dirname, "..", "..");
  const sqlitePath = process.env.SQLITE_PATH
    ? path.resolve(process.env.SQLITE_PATH)
    : path.join(repoRoot, "data", "app_data.sqlite");

  const docsDir = process.env.DOCS_DIR
    ? path.resolve(process.env.DOCS_DIR)
    : path.join(repoRoot, "qafFilesManager", "assets", "dep");

  const extractedDir = process.env.EXTRACTED_DIR
    ? path.resolve(process.env.EXTRACTED_DIR)
    : path.join(repoRoot, "data", "extracted");

  assertTruthy(fileExists(sqlitePath), `SQLite DB not found: ${sqlitePath}`);
  assertTruthy(fileExists(docsDir), `Docs directory not found: ${docsDir}`);

  const db = new Database(sqlitePath, { readonly: true });
  assertTruthy(process.env.DATABASE_URL, "DATABASE_URL is required in web/.env");
  assertTruthy(
    process.env.SHADOW_DATABASE_URL,
    "SHADOW_DATABASE_URL is required in web/.env"
  );
  const prisma = new PrismaClient();

  mkdirp(path.join(repoRoot, "web", "public", "uploads", "docs"));
  mkdirp(path.join(repoRoot, "web", "public", "uploads", "assets"));

  console.log("Importing sections...");
  const sqliteSections = db
    .prepare(
      "select section_number as number, title, section_type as type from sections order by section_number"
    )
    .all() as SqliteSectionRow[];

  for (const section of sqliteSections) {
    await prisma.section.upsert({
      where: { number: section.number },
      update: {
        title: section.title || String(section.number),
        type: normalizeSectionType(section.type),
      },
      create: {
        number: section.number,
        title: section.title || String(section.number),
        type: normalizeSectionType(section.type),
      },
    });
  }

  const sectionMap = new Map(
    (await prisma.section.findMany({ select: { id: true, number: true } })).map(
      (s) => [s.number, s.id] as const
    )
  );

  console.log("Importing terms...");
  const sqliteTerms = db
    .prepare(
      "select section_number as sectionNumber, item_number as itemNumber, term, description, abbreviation from terms order by section_number, id"
    )
    .all() as SqliteTermRow[];

  await prisma.term.deleteMany({});

  const termRows = [] as Array<{
    sectionId: number;
    itemNumber: string | null;
    term: string;
    description: string | null;
    abbreviation: string | null;
  }>;

  for (const term of sqliteTerms) {
    const sectionId = sectionMap.get(term.sectionNumber);
    if (!sectionId) continue;
    termRows.push({
      sectionId,
      itemNumber: term.itemNumber ?? null,
      term: term.term ?? "",
      description: term.description ?? null,
      abbreviation: term.abbreviation ?? null,
    });
  }

  const chunkSize = 500;
  for (let i = 0; i < termRows.length; i += chunkSize) {
    const chunk = termRows.slice(i, i + chunkSize);
    await prisma.term.createMany({ data: chunk });
    console.log(`  terms: ${Math.min(i + chunkSize, termRows.length)}/${termRows.length}`);
  }

  console.log("Importing documents (grouping PDF/DOC/DOCX variants)...");
  const sqliteDocs = db
    .prepare(
      "select id, section_number as sectionNumber, source_path as sourcePath, title, doc_type as docType, text_content as textContent from documents order by section_number, id"
    )
    .all() as SqliteDocumentRow[];

  await prisma.documentAsset.deleteMany({});
  await prisma.documentVariant.deleteMany({});
  await prisma.document.deleteMany({});

  const docsByKey = new Map<
    string,
    Array<
      SqliteDocumentRow & { sectionId: number; code: string; resolvedPath: string | null }
    >
  >();

  for (const row of sqliteDocs) {
    const sectionNumber = row.sectionNumber ?? null;
    if (!sectionNumber) continue;

    const sectionId = sectionMap.get(sectionNumber);
    if (!sectionId) continue;

    const resolved = resolveSourcePath(row.sourcePath, { docsDir, extractedDir });
    const candidateName = resolved || row.sourcePath;
    const code = path.basename(candidateName, path.extname(candidateName)) || `section${sectionNumber}`;
    const key = `${sectionId}:${code}`;

    const list = docsByKey.get(key) || [];
    list.push({ ...row, sectionId, code, resolvedPath: resolved });
    docsByKey.set(key, list);
  }

  for (const variants of docsByKey.values()) {
    const { sectionId, code } = variants[0];
    const title = variants.find((v) => v.title)?.title || null;

    const docxVariant = variants.find((v) => normalizeDocFormat(v.docType) === "docx");
    let contentHtml: string | null = null;

    if (docxVariant?.resolvedPath) {
      try {
        const result = await mammoth.convertToHtml(
          { path: docxVariant.resolvedPath },
          {
            convertImage: mammoth.images.imgElement(async (image) => {
              const buffer = (await image.read("buffer")) as Buffer;
              const hash = sha256Buffer(buffer);
              const ext = extFromContentType(image.contentType);

              const destUrl = path.posix.join("/uploads/assets", `${hash}${ext}`);
              const destAbs = path.join(
                repoRoot,
                "web",
                "public",
                "uploads",
                "assets",
                `${hash}${ext}`
              );

              if (!fileExists(destAbs)) {
                mkdirp(path.dirname(destAbs));
                fs.writeFileSync(destAbs, buffer);
              }

              return { src: destUrl };
            }),
          }
        );
        contentHtml = result.value || null;
      } catch (err) {
        console.warn(
          `  mammoth failed for ${docxVariant.resolvedPath}:`,
          err instanceof Error ? err.message : err
        );
      }
    }

    const document = await prisma.document.create({
      data: {
        sectionId,
        code,
        title,
        contentHtml,
      },
      select: { id: true },
    });

    const seenFormats = new Set<string>();
    for (const variant of variants) {
      const format = normalizeDocFormat(variant.docType);
      if (!format) continue;
      if (!variant.resolvedPath) continue;
      if (seenFormats.has(format)) continue;
      seenFormats.add(format);

      const destUrl = path.posix.join("/uploads/docs", `${code}.${format}`);
      const destAbs = path.join(
        repoRoot,
        "web",
        "public",
        "uploads",
        "docs",
        `${code}.${format}`
      );

      copyIfNeeded(variant.resolvedPath, destAbs);

      await prisma.documentVariant.create({
        data: {
          documentId: document.id,
          format,
          sourcePath: destUrl,
          mimeType: mimeTypeForFormat(format),
        },
      });
    }
  }

  console.log("Importing extracted images as deduped assets...");
  const sqliteImages = db
    .prepare(
      "select document_id as documentId, image_path as imagePath, width, height, page from images order by document_id, id"
    )
    .all() as SqliteImageRow[];

  // Build a map from SQLite document id -> (sectionId, code)
  const sqliteDocIdToKey = new Map<number, string>();
  for (const row of sqliteDocs) {
    const sectionNumber = row.sectionNumber ?? null;
    if (!sectionNumber) continue;

    const sectionId = sectionMap.get(sectionNumber);
    if (!sectionId) continue;

    const resolved = resolveSourcePath(row.sourcePath, { docsDir, extractedDir });
    const candidateName = resolved || row.sourcePath;
    const code = path.basename(candidateName, path.extname(candidateName)) || `section${sectionNumber}`;
    sqliteDocIdToKey.set(row.id, `${sectionId}:${code}`);
  }

  const documentByKey = new Map(
    (await prisma.document.findMany({ select: { id: true, sectionId: true, code: true } })).map(
      (d) => [`${d.sectionId}:${d.code}`, d] as const
    )
  );

  let linked = 0;
  for (const img of sqliteImages) {
    const docKey = sqliteDocIdToKey.get(img.documentId);
    if (!docKey) continue;

    const document = documentByKey.get(docKey);
    if (!document) continue;

    const resolvedImg = resolveSourcePath(img.imagePath, { extractedDir });
    if (!resolvedImg) continue;

    const hash = sha256File(resolvedImg);
    const ext = path.extname(resolvedImg).toLowerCase() || ".png";

    const destUrl = path.posix.join("/uploads/assets", `${hash}${ext}`);
    const destAbs = path.join(
      repoRoot,
      "web",
      "public",
      "uploads",
      "assets",
      `${hash}${ext}`
    );

    copyIfNeeded(resolvedImg, destAbs);

    const isLogo =
      img.width !== null &&
      img.height !== null &&
      img.width > 0 &&
      img.height > 0 &&
      img.width <= 200 &&
      img.height <= 200;

    const asset = await prisma.asset.upsert({
      where: { sha256: hash },
      update: {
        path: destUrl,
        width: img.width,
        height: img.height,
        isLogo,
      },
      create: {
        kind: "image",
        sha256: hash,
        path: destUrl,
        width: img.width,
        height: img.height,
        isLogo,
      },
      select: { id: true },
    });

    try {
      await prisma.documentAsset.create({
        data: {
          documentId: document.id,
          assetId: asset.id,
          order: img.page,
        },
      });
      linked += 1;
    } catch {
      // ignore duplicate link
    }
  }

  console.log(`Done. Linked ${linked} document images.`);

  await prisma.$disconnect();
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
