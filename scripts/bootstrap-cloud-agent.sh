#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

export PUPPETEER_SKIP_DOWNLOAD=true
export CI=true

if [[ "${CLAUDE_CODE_REMOTE:-}" == "true" ]]; then
  bash scripts/claude-cloud-session-start.sh
fi

npm ci --no-audit --no-fund --loglevel=error

echo "Gogetta cloud agent dependencies are ready."
