from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DB_PATH = ROOT / "data" / "app_data.sqlite"
EXTRACTED_DIR = ROOT / "data" / "extracted"
DEPS_DIR = ROOT / "qafFilesManager" / "assets" / "dep"
LOGO_PATH = ROOT / "qafFilesManager" / "images" / "logo.png"
