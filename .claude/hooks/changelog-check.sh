#!/usr/bin/env bash
# Stop hook: nhắc cập nhật docs/CHANGELOG.md khi có thay đổi nguồn chưa được ghi nhận.
#
# Chỉ fire khi CẢ HAI điều kiện đúng:
#   1. Có thay đổi chưa commit ở src/, patches/, package.json
#   2. VÀ docs/CHANGELOG.md CŨ HƠN thay đổi nguồn mới nhất (tức chưa được cập nhật)
#
# Điều kiện 2 phá vòng lặp: sau khi cập nhật changelog, mtime của nó mới hơn
# thay đổi nguồn -> hook im lặng, turn kết thúc bình thường.

set -euo pipefail

SOURCE_PATHS="src/ patches/ package.json"
CHANGELOG="docs/CHANGELOG.md"

# 1. Có thay đổi nguồn chưa commit không?
if ! git status --porcelain -- $SOURCE_PATHS 2>/dev/null | grep -q .; then
  exit 0
fi

# 2. mtime (giây) mới nhất của các file nguồn bị thay đổi
newest_src=$(git status --porcelain -- $SOURCE_PATHS 2>/dev/null \
  | awk '{print $2}' \
  | while read -r f; do stat -f '%m' "$f" 2>/dev/null; done \
  | sort -n | tail -1)

changelog_mtime=$(stat -f '%m' "$CHANGELOG" 2>/dev/null || echo 0)

# Nếu changelog đã mới hơn (hoặc bằng) thay đổi nguồn -> đã cập nhật, im lặng
if [ -n "$newest_src" ] && [ "$changelog_mtime" -ge "$newest_src" ]; then
  exit 0
fi

echo '{"hookSpecificOutput":{"hookEventName":"Stop","additionalContext":"[Changelog] Có thay đổi file nguồn trong phiên này. Nếu thay đổi đáng kể (feature/fix/breaking/chore lớn), hãy cập nhật docs/CHANGELOG.md — gọi skill /update-changelog."}}'
