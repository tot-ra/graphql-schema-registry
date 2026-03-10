#!/usr/bin/env sh
set -eu

echo "Setting up git hooks..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/.githooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "Error: .githooks directory not found"
  exit 1
fi

chmod +x "$HOOKS_DIR"/*
git config core.hooksPath .githooks

echo "Git hooks installed successfully."
echo "Pre-commit will run Biome checks before each commit."
