#!/usr/bin/env bash
# UserPromptSubmit hook: append the hook payload (JSON on stdin) to a log file.
#
# IMPORTANT: this script must print NOTHING to stdout. For UserPromptSubmit,
# whatever a hook writes to stdout is injected into the prompt context — so we
# write only to the log file and exit 0.
set -euo pipefail

log_file="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/user-prompts.txt"
input="$(cat)"

{
  printf '===== %s =====\n' "$(date '+%Y-%m-%d %H:%M:%S')"
  printf '%s\n\n' "$input"
} >> "$log_file"

exit 0
