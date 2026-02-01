#!/bin/bash
# PostToolUse observation logger
# Appends one-line summaries to .claude/observations/YYYY-MM-DD.md

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
[ -z "$TOOL_NAME" ] && exit 0

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OBS_DIR="$PROJECT_DIR/.claude/observations"
mkdir -p "$OBS_DIR"

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
FILE="$OBS_DIR/$DATE.md"

# Create header if file is new
if [ ! -f "$FILE" ]; then
  echo "# $DATE Observations" > "$FILE"
  echo "" >> "$FILE"
fi

case "$TOOL_NAME" in
  Read)
    PATH_VAL=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
    echo "- [$TIME] READ $PATH_VAL" >> "$FILE"
    ;;
  Edit)
    PATH_VAL=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
    OLD=$(echo "$INPUT" | jq -r '.tool_input.old_string // empty' | head -1 | cut -c1-40)
    NEW=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty' | head -1 | cut -c1-40)
    echo "- [$TIME] EDIT $PATH_VAL — $OLD → $NEW" >> "$FILE"
    ;;
  Write)
    PATH_VAL=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
    echo "- [$TIME] WRITE $PATH_VAL" >> "$FILE"
    ;;
  Bash)
    CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' | head -1 | cut -c1-60)
    EXIT_CODE=$(echo "$INPUT" | jq -r '.tool_response.exitCode // "?"')
    echo "- [$TIME] BASH $CMD (exit: $EXIT_CODE)" >> "$FILE"
    ;;
  Grep)
    PATTERN=$(echo "$INPUT" | jq -r '.tool_input.pattern // empty')
    GREP_PATH=$(echo "$INPUT" | jq -r '.tool_input.path // "."')
    echo "- [$TIME] GREP \"$PATTERN\" in $GREP_PATH" >> "$FILE"
    ;;
  Glob)
    PATTERN=$(echo "$INPUT" | jq -r '.tool_input.pattern // empty')
    echo "- [$TIME] GLOB \"$PATTERN\"" >> "$FILE"
    ;;
  Task)
    DESC=$(echo "$INPUT" | jq -r '.tool_input.description // empty')
    echo "- [$TIME] TASK $DESC" >> "$FILE"
    ;;
  *)
    echo "- [$TIME] $TOOL_NAME" >> "$FILE"
    ;;
esac
