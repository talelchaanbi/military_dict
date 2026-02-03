#!/usr/bin/env python3
from __future__ import annotations

import os
import sqlite3
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import docx
import docx2txt
import pdfplumber
import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parents[1]
DEPS_DIR = ROOT / "qafFilesManager" / "assets" / "dep"
OUTPUT_DIR = ROOT / "data" / "extracted"
IMAGES_DIR = OUTPUT_DIR / "images"
DB_PATH = ROOT / "data" / "app_data.sqlite"


def ensure_dirs() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def init_db(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section_number INTEGER UNIQUE,
            title TEXT,
            section_type TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_path TEXT NOT NULL,
            title TEXT,
            doc_type TEXT NOT NULL,
            text_content TEXT,
            section_number INTEGER,
            FOREIGN KEY(section_number) REFERENCES sections(section_number)
        )
        """
    )
    _ensure_column(conn, "documents", "section_number")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            source_path TEXT NOT NULL,
            image_path TEXT NOT NULL,
            page INTEGER,
            width INTEGER,
            height INTEGER,
            FOREIGN KEY(document_id) REFERENCES documents(id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS term_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            term_id INTEGER NOT NULL,
            document_id INTEGER NOT NULL,
            note TEXT,
            FOREIGN KEY(term_id) REFERENCES terms(id),
            FOREIGN KEY(document_id) REFERENCES documents(id)
        )
        """
    )
    conn.commit()


def _ensure_column(conn: sqlite3.Connection, table: str, column: str) -> None:
    cur = conn.execute(f"PRAGMA table_info({table})")
    existing = {row[1] for row in cur.fetchall()}
    if column not in existing:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} INTEGER")
        conn.commit()


def insert_document(
    conn: sqlite3.Connection,
    source_path: str,
    title: Optional[str],
    doc_type: str,
    text: str,
    section_number: Optional[int],
) -> int:
    if section_number is not None:
        conn.execute(
            "INSERT OR IGNORE INTO sections (section_number, title, section_type) VALUES (?, ?, ?)",
            (section_number, title, "document"),
        )
    cur = conn.execute(
        """
        INSERT INTO documents (source_path, title, doc_type, text_content, section_number)
        VALUES (?, ?, ?, ?, ?)
        """,
        (source_path, title, doc_type, text, section_number),
    )
    conn.commit()
    return int(cur.lastrowid)


def insert_image(
    conn: sqlite3.Connection,
    document_id: int,
    source_path: str,
    image_path: str,
    page: Optional[int],
    width: Optional[int],
    height: Optional[int],
) -> None:
    conn.execute(
        """
        INSERT INTO images (document_id, source_path, image_path, page, width, height)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (document_id, source_path, image_path, page, width, height),
    )
    conn.commit()


def extract_docx(conn: sqlite3.Connection, path: Path) -> None:
    text = ""
    try:
        doc = docx.Document(str(path))
        text = "\n".join(p.text for p in doc.paragraphs if p.text)
    except Exception:
        text = ""

    section_number = _extract_section_number(path)
    doc_id = insert_document(conn, str(path), path.stem, "docx", text, section_number)

    img_out = IMAGES_DIR / path.stem
    img_out.mkdir(parents=True, exist_ok=True)
    try:
        docx2txt.process(str(path), str(img_out))
    except Exception:
        return

    for img_file in img_out.iterdir():
        if img_file.is_file():
            insert_image(conn, doc_id, str(path), str(img_file), None, None, None)


def extract_pdf(conn: sqlite3.Connection, path: Path) -> None:
    text_parts = []
    try:
        with pdfplumber.open(str(path)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                if page_text:
                    text_parts.append(page_text)
    except Exception:
        text_parts = []

    section_number = _extract_section_number(path)
    doc_id = insert_document(conn, str(path), path.stem, "pdf", "\n".join(text_parts), section_number)

    img_out = IMAGES_DIR / path.stem
    img_out.mkdir(parents=True, exist_ok=True)

    try:
        pdf_doc = fitz.open(str(path))
        for page_index in range(len(pdf_doc)):
            page = pdf_doc[page_index]
            for img_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base = pdf_doc.extract_image(xref)
                img_bytes = base["image"]
                ext = base.get("ext", "png")
                img_name = f"page_{page_index + 1}_img_{img_index + 1}.{ext}"
                img_path = img_out / img_name
                with open(img_path, "wb") as f:
                    f.write(img_bytes)
                insert_image(conn, doc_id, str(path), str(img_path), page_index + 1, base.get("width"), base.get("height"))
        pdf_doc.close()
    except Exception:
        return


def convert_doc_to_docx(doc_path: Path) -> Optional[Path]:
    soffice = "soffice"
    if not shutil_which(soffice):
        return None

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)
        try:
            subprocess.run(
                [soffice, "--headless", "--convert-to", "docx", "--outdir", str(tmpdir_path), str(doc_path)],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except Exception:
            return None

        converted = tmpdir_path / f"{doc_path.stem}.docx"
        if converted.exists():
            target = doc_path.with_suffix(".docx")
            converted.replace(target)
            return target
    return None


def shutil_which(cmd: str) -> Optional[str]:
    for path in os.environ.get("PATH", "").split(os.pathsep):
        candidate = Path(path) / cmd
        if candidate.exists() and os.access(candidate, os.X_OK):
            return str(candidate)
    return None


def _extract_section_number(path: Path) -> Optional[int]:
    stem = path.stem
    digits = "".join(ch for ch in stem if ch.isdigit())
    if digits:
        try:
            return int(digits)
        except ValueError:
            return None
    return None


def main() -> None:
    ensure_dirs()
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(DB_PATH))
    init_db(conn)

    for file_path in sorted(DEPS_DIR.glob("*")):
        if file_path.suffix.lower() == ".docx":
            extract_docx(conn, file_path)
        elif file_path.suffix.lower() == ".pdf":
            extract_pdf(conn, file_path)
        elif file_path.suffix.lower() == ".doc":
            converted = convert_doc_to_docx(file_path)
            if converted:
                extract_docx(conn, converted)

    conn.close()


if __name__ == "__main__":
    main()
