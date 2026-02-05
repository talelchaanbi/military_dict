#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(script: str) -> None:
    path = ROOT / "tools" / script
    if not path.exists():
        raise SystemExit(f"Missing script: {path}")
    subprocess.run([sys.executable, str(path)], check=True)


def main() -> None:
    # Order matters: documents creates base DB + documents/images, terms adds terms.
    run("extract_documents.py")
    run("extract_terms.py")
    print("OK: data/app_data.sqlite updated")


if __name__ == "__main__":
    main()
