#!/usr/bin/env python3
from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import List, Optional, Tuple

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
DETAILS_DIR = ROOT / "qafFilesManager" / "Department" / "Details"
DB_PATH = ROOT / "data" / "app_data.sqlite"


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
        CREATE TABLE IF NOT EXISTS terms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_path TEXT NOT NULL,
            section_number INTEGER NOT NULL,
            section_title TEXT,
            item_number TEXT,
            term TEXT,
            description TEXT,
            abbreviation TEXT
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
    conn.execute("CREATE INDEX IF NOT EXISTS idx_terms_section ON terms(section_number)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_terms_term ON terms(term)")
    conn.commit()


def extract_section_title(soup: BeautifulSoup) -> Optional[str]:
    title = soup.select_one(".department-main-title")
    if title:
        return title.get_text(strip=True)
    return None


def extract_rows(soup: BeautifulSoup) -> List[Tuple[str, str, str, str]]:
    rows = []
    for tr in soup.select("#termsTable tbody tr"):
        cells = [td.get_text(strip=True) for td in tr.find_all("td")]
        if len(cells) >= 4:
            item_number, term, description, abbreviation = cells[:4]
            rows.append((item_number, term, description, abbreviation))
    return rows


def process_file(conn: sqlite3.Connection, path: Path) -> None:
    html = path.read_text(encoding="utf-8", errors="ignore")
    soup = BeautifulSoup(html, "lxml")
    section_title = extract_section_title(soup)

    try:
        section_number = int(path.stem)
    except ValueError:
        return

    if section_title:
        conn.execute(
            "INSERT OR IGNORE INTO sections (section_number, title, section_type) VALUES (?, ?, ?)",
            (section_number, section_title, "terms"),
        )
        conn.commit()

    rows = extract_rows(soup)
    for item_number, term, description, abbreviation in rows:
        conn.execute(
            """
            INSERT INTO terms (source_path, section_number, section_title, item_number, term, description, abbreviation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (str(path), section_number, section_title, item_number, term, description, abbreviation),
        )
    conn.commit()


def main() -> None:
    if not DB_PATH.exists():
        raise SystemExit(f"Database not found: {DB_PATH}")

    conn = sqlite3.connect(str(DB_PATH))
    init_db(conn)

    for html_file in sorted(DETAILS_DIR.glob("*.html")):
        # Sections 12 and 13 are document viewer pages; they have no terms table.
        if html_file.stem in {"12", "13"}:
            continue
        process_file(conn, html_file)

    conn.close()


if __name__ == "__main__":
    main()
