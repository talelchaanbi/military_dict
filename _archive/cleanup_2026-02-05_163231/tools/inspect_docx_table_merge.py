#!/usr/bin/env python3

import argparse
import html
import re
import zipfile


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Inspect a .docx (WordprocessingML) for table row/cell merge hints (vMerge/gridSpan) "
            "around specific text needles."
        )
    )
    parser.add_argument("docx_path", help="Path to .docx file")
    parser.add_argument(
        "--needles",
        nargs="+",
        default=[],
        help="One or more substrings to locate within <w:tr> blocks",
    )
    parser.add_argument(
        "--max-hits",
        type=int,
        default=20,
        help="Maximum matching rows to print",
    )
    parser.add_argument(
        "--context-rows",
        type=int,
        default=2,
        help="How many subsequent rows to preview",
    )
    parser.add_argument(
        "--max-cells",
        type=int,
        default=8,
        help="Maximum number of cells to print per matching row",
    )
    parser.add_argument(
        "--hide-empty-cells",
        action="store_true",
        help="Only print cells that have text or merge/span properties",
    )
    return parser.parse_args()


def normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def extract_cell_info(cell_xml: str) -> tuple[str, str | None, int]:
    # IMPORTANT: match <w:t> (text runs) only.
    # A loose pattern like <w:t[^>]*> incorrectly matches tags such as <w:tcPr>.
    texts = re.findall(r"<w:t(?:\s[^>]*)?>(.*?)</w:t>", cell_xml, flags=re.DOTALL)
    text = normalize_ws(html.unescape("".join(texts)))

    vmerge_match = re.search(r"<w:vMerge(?:\s+w:val=\"([^\"]*)\")?\s*/>", cell_xml)
    if not vmerge_match:
        vmerge_match = re.search(r"<w:vMerge(?:\s+w:val=\"([^\"]*)\")?\s*>", cell_xml)
    vmerge = vmerge_match.group(1) if vmerge_match else None

    grid_span_match = re.search(r"<w:gridSpan\s+w:val=\"(\d+)\"\s*/>", cell_xml)
    grid_span = int(grid_span_match.group(1)) if grid_span_match else 1

    return text, vmerge, grid_span


def preview_row_text(row_xml: str) -> str:
    cells = re.split(r"(?=<w:tc\b)", row_xml)
    parts: list[str] = []
    for c in cells:
        if not c.startswith("<w:tc"):
            continue
        text, _, _ = extract_cell_info(c)
        if text:
            parts.append(text)
    return normalize_ws(" | ".join(parts))


def main() -> int:
    args = parse_args()

    with zipfile.ZipFile(args.docx_path) as z:
        xml = z.read("word/document.xml").decode("utf-8", "ignore")

    rows = re.split(r"(?=<w:tr\b)", xml)

    needles = [n for n in args.needles if n]
    if not needles:
        raise SystemExit("Provide at least one --needles value")

    hits: list[int] = []
    for idx, row in enumerate(rows):
        if not row.startswith("<w:tr"):
            continue
        if any(n in row for n in needles):
            hits.append(idx)

    print(f"Found {len(hits)} matching <w:tr> rows")

    for idx in hits[: args.max_hits]:
        row = rows[idx]
        cells = re.split(r"(?=<w:tc\b)", row)

        print(f"\n=== ROW {idx} ===")
        row_preview = preview_row_text(row)
        if row_preview:
            if len(row_preview) > 240:
                row_preview = row_preview[:237] + "..."
            print(f"rowText: {row_preview!r}")
        cell_index = 0
        for c in cells:
            if not c.startswith("<w:tc"):
                continue
            text, vmerge, grid_span = extract_cell_info(c)
            if cell_index >= args.max_cells:
                break

            if args.hide_empty_cells and not text and vmerge is None and grid_span == 1:
                cell_index += 1
                continue

            if len(text) > 140:
                text = text[:137] + "..."
            print(f"[{cell_index}] gridSpan={grid_span} vMerge={vmerge} text={text!r}")
            cell_index += 1

        for off in range(1, args.context_rows + 1):
            if idx + off >= len(rows):
                break
            r = rows[idx + off]
            if not r.startswith("<w:tr"):
                continue
            preview = preview_row_text(r)
            if len(preview) > 200:
                preview = preview[:197] + "..."
            print(f"  next+{off}: {preview!r}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
