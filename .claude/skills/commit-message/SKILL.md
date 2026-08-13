---
name: commit-message
description: Viết commit message theo conventional commits (feat/fix/breaking/chore) nhất quán với CHANGELOG. Dùng khi commit thay đổi code.
---

# Commit Message

Viết commit message theo **conventional commits**, nhất quán với phân loại trong `docs/CHANGELOG.md`.

## Quy ước

Format: `<type>: <mô tả ngắn>`

| Type | Ý nghĩa | Khớp CHANGELOG |
|------|---------|----------------|
| `feat:` | Tính năng mới | Features |
| `fix:` | Sửa lỗi | Fixes |
| `breaking:` | Thay đổi phá vỡ tương thích | Breaking |
| `chore:` | Dọn dẹp, build, cấu hình, patch | Chore |

## Quy tắc

1. **Mô tả ngắn gọn**, thì hiện tại, ≤72 ký tự, viết **tiếng Việt**.
2. **Một commit = một thay đổi logic** — không gộp nhiều việc không liên quan.
3. Trước khi commit thay đổi **đáng kể** → cập nhật `docs/CHANGELOG.md` trước (gọi `/update-changelog`).
4. Không commit file nhạy cảm (`.env`, `.claude/settings.json` — đã trong `.gitignore`).

## Ví dụ (từ git log hiện có)

```
feat: Hỗ trợ YouTube playlist trong /play
fix: Fix crash khi voice channel undefined
breaking: Thay ytdl-core bằng @distube/yt-dlp
chore: Patch @distube/yt-dlp bỏ --no-call-home
```
