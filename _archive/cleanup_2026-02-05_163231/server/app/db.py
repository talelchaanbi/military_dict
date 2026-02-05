from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Tuple

from .settings import DB_PATH, DEPS_DIR, EXTRACTED_DIR, ROOT


def _connect(db_path: Path = DB_PATH) -> sqlite3.Connection:
    if not db_path.exists():
        raise FileNotFoundError(f"SQLite DB not found: {db_path}")
    conn = sqlite3.connect(str(db_path), check_same_thread=False, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


@contextmanager
def get_conn() -> Iterator[sqlite3.Connection]:
    conn = _connect()
    try:
        yield conn
    finally:
        conn.close()


def list_sections(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    sections = [dict(row) for row in conn.execute(
        "SELECT section_number, title, section_type FROM sections ORDER BY section_number"
    ).fetchall()]

    term_counts = {
        int(row[0]): int(row[1])
        for row in conn.execute(
            "SELECT section_number, COUNT(*) FROM terms GROUP BY section_number"
        ).fetchall()
    }
    doc_counts = {
        int(row[0]): int(row[1])
        for row in conn.execute(
            "SELECT section_number, COUNT(*) FROM documents WHERE section_number IS NOT NULL GROUP BY section_number"
        ).fetchall()
    }

    for sec in sections:
        n = int(sec["section_number"])
        sec["terms_count"] = term_counts.get(n, 0)
        sec["documents_count"] = doc_counts.get(n, 0)
    return sections


def get_section(conn: sqlite3.Connection, section_number: int) -> Optional[Dict[str, Any]]:
    row = conn.execute(
        "SELECT section_number, title, section_type FROM sections WHERE section_number = ?",
        (section_number,),
    ).fetchone()
    return dict(row) if row else None


def search_terms(
    conn: sqlite3.Connection,
    q: str,
    section_number: Optional[int],
    limit: int,
    offset: int,
) -> Tuple[List[Dict[str, Any]], int]:
    q_like = f"%{q.strip()}%" if q else "%"

    where = "(term LIKE ? OR description LIKE ? OR abbreviation LIKE ?)"
    params: List[Any] = [q_like, q_like, q_like]

    if section_number is not None:
        where += " AND section_number = ?"
        params.append(int(section_number))

    total = int(
        conn.execute(
            f"SELECT COUNT(*) FROM terms WHERE {where}",
            params,
        ).fetchone()[0]
    )

    rows = conn.execute(
        f"""
        SELECT id, section_number, section_title, item_number, term, description, abbreviation
        FROM terms
        WHERE {where}
        ORDER BY section_number, CAST(item_number AS INTEGER), item_number
        LIMIT ? OFFSET ?
        """,
        [*params, int(limit), int(offset)],
    ).fetchall()

    return [dict(r) for r in rows], total


def list_documents(conn: sqlite3.Connection, section_number: int) -> List[Dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT id, source_path, title, doc_type, section_number
        FROM documents
        WHERE section_number = ?
        ORDER BY id
        """,
        (int(section_number),),
    ).fetchall()
    docs: List[Dict[str, Any]] = []
    for r in rows:
        item = dict(r)
        resolved = _resolve_dep_path(item.get("source_path") or "")
        if not resolved:
            # Hide stale/foreign paths (e.g. DB copied from another machine)
            continue
        item["resolved_path"] = str(resolved)
        item["download_url"] = f"/files/doc/{int(item['id'])}"
        docs.append(item)
    return docs


def get_document(conn: sqlite3.Connection, document_id: int) -> Optional[Dict[str, Any]]:
    row = conn.execute(
        "SELECT id, source_path, title, doc_type, text_content, section_number FROM documents WHERE id = ?",
        (int(document_id),),
    ).fetchone()
    if not row:
        return None
    item = dict(row)
    resolved = _resolve_dep_path(item.get("source_path") or "")
    item["resolved_path"] = str(resolved) if resolved else None
    return item


def _resolve_dep_path(source_path: str) -> Optional[Path]:
    if not source_path:
        return None
    p = Path(source_path)
    if not p.is_absolute():
        p = (ROOT / p).resolve()
    else:
        p = p.resolve()

    if not p.exists():
        return None
    try:
        p.relative_to(DEPS_DIR.resolve())
    except Exception:
        return None
    return p


def list_document_images(conn: sqlite3.Connection, document_id: int) -> List[Dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT id, document_id, image_path, page, width, height
        FROM images
        WHERE document_id = ?
        ORDER BY page, id
        """,
        (int(document_id),),
    ).fetchall()

    images: List[Dict[str, Any]] = []
    for r in rows:
        item = dict(r)
        try:
            rel = Path(item["image_path"]).resolve().relative_to(EXTRACTED_DIR.resolve())
            item["url"] = f"/extracted/{rel.as_posix()}"
        except Exception:
            item["url"] = None
        images.append(item)

    return images
