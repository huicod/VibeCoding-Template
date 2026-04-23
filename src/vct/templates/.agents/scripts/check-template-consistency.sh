#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

TARGETS=(
  "AGENTS.md"
  ".vibe/docs"
  ".agents/workflows"
  ".agents/skills"
)

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

check_no_match() {
  local pattern="$1"
  local label="$2"
  if rg -n --hidden --glob '!.vibe/artifacts/**' --glob '!.agents/scripts/check-template-consistency.sh' "$pattern" "${TARGETS[@]}" >/tmp/template_check_match.txt 2>/dev/null; then
    echo "FAIL: found forbidden pattern for ${label}" >&2
    cat /tmp/template_check_match.txt >&2
    exit 1
  fi
}

expected_workflows=24
expected_skills=20

actual_workflows="$(find ".agents/workflows" -maxdepth 1 -type f | wc -l | tr -d ' ')"
actual_skills="$(find ".agents/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"

[[ "$actual_workflows" == "$expected_workflows" ]] || fail "workflow count mismatch: expected ${expected_workflows}, got ${actual_workflows}"
[[ "$actual_skills" == "$expected_skills" ]] || fail "skill count mismatch: expected ${expected_skills}, got ${actual_skills}"

check_no_match 'ADR001' 'stale ADR naming'
check_no_match '02_ARCHITECTURE\.md' 'stale architecture filename'
check_no_match '13 个 skills' 'stale skill count'
check_no_match '17 条' 'stale constitution count'
check_no_match 'view_file' 'host-specific file read pseudo-tool'
check_no_match 'replace_file_content' 'host-specific file edit pseudo-tool'
check_no_match 'multi_replace_file_content' 'host-specific multi-edit pseudo-tool'
check_no_match 'sequentialthinking' 'host-specific sequential thinking tool name'

if find .vibe/genesis -mindepth 1 ! -name '.gitkeep' | read -r _; then
  fail "template genesis directory is not empty; expected only .vibe/genesis/.gitkeep in source template"
fi

echo "OK: template consistency checks passed"
