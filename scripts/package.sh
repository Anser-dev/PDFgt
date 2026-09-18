#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
ZIP_PATH="$DIST_DIR/sat-pdf-local-0.1.0.zip"
STAGE_DIR="$(mktemp -d)"
trap 'rm -rf "$STAGE_DIR"' EXIT

mkdir -p "$DIST_DIR"
cp "$ROOT_DIR/extension/manifest.json" "$STAGE_DIR/"
cp "$ROOT_DIR/extension/content.js" "$STAGE_DIR/"
cp "$ROOT_DIR/README.md" "$STAGE_DIR/"
cp "$ROOT_DIR/PRIVACIDAD.md" "$STAGE_DIR/"
cp "$ROOT_DIR/FUENTES.md" "$STAGE_DIR/"

# ZIP stores file modification times; fix them so temporary staging metadata is stable.
touch -t 200001010000 "$STAGE_DIR"/*

rm -f "$ZIP_PATH"
(cd "$STAGE_DIR" && zip -q -X "$ZIP_PATH" manifest.json content.js README.md PRIVACIDAD.md FUENTES.md)
(cd "$DIST_DIR" && sha256sum "$(basename "$ZIP_PATH")" > "$(basename "$ZIP_PATH").sha256")
cat "$ZIP_PATH.sha256"
printf 'Created %s\n' "$ZIP_PATH"
