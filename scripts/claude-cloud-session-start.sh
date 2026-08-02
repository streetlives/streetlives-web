#!/usr/bin/env bash
set -euo pipefail

if [[ "${CLAUDE_CODE_REMOTE:-}" != "true" ]]; then
  exit 0
fi

append_claude_env() {
  local env_name="$1"
  local env_value="$2"

  export "${env_name}=${env_value}"
  if [[ -n "${CLAUDE_ENV_FILE:-}" ]]; then
    printf 'export %s=%q\n' "$env_name" "$env_value" >> "$CLAUDE_ENV_FILE"
  fi
}

if [[ -n "${STREETLIVES_SCHEDULED_PATCH_ADMIN_TOKEN:-}" && -z "${STREETLI_SCHEDULED_PATCH_ADMIN_TOKEN:-}" ]]; then
  append_claude_env "STREETLI_SCHEDULED_PATCH_ADMIN_TOKEN" "$STREETLIVES_SCHEDULED_PATCH_ADMIN_TOKEN"
fi

append_claude_env "PUPPETEER_SKIP_DOWNLOAD" "true"
append_claude_env "CI" "true"

echo "Claude cloud Gogetta session environment prepared."
