# 📚 Tài liệu dự án

Thư mục này lưu lại **quá trình phát triển** của bot Discord music — không phải hướng dẫn sử dụng (xem `README.md` ở gốc repo cho phần đó). Mục đích: giúp dự án dễ **scale**, dễ **onboard** người mới, và giữ lại lý do đằng sau các quyết định kỹ thuật.

## Các file

| File | Nội dung |
|------|----------|
| [`CHANGELOG.md`](CHANGELOG.md) | **Log phát triển theo thời gian** — mới nhất ở trên. Ghi lại các thay đổi đáng kể: feature, fix, breaking, chore. |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Kiến trúc hiện tại: cấu trúc code, DisTube + plugins, patch yt-dlp, biến môi trường, deploy. |
| [`DECISIONS.md`](DECISIONS.md) | Các quyết định kỹ thuật quan trọng (ADR) và lý do chọn chúng. |

## Quy ước cập nhật

- **Mỗi khi có thay đổi code đáng kể** → cập nhật `CHANGELOG.md` (gọi skill `/update-changelog`).
- Thay đổi ảnh hưởng kiến trúc → cập nhật thêm `ARCHITECTURE.md`.
- Quyết định kỹ thuật quan trọng → thêm vào `DECISIONS.md`.
- Viết bằng **tiếng Việt**, ngắn gọn, nhất quán với README.

## Skill phát triển

Các skill trong `.claude/skills/` giúp phát triển dự án có quy tắc:

| Skill | Mục đích |
|-------|----------|
| `/update-changelog` | Cập nhật `CHANGELOG.md` sau mỗi thay đổi đáng kể. |
| `/commit-message` | Viết commit message theo conventional commits, đồng bộ CHANGELOG. |
| `/deploy` | Deploy lên Railway/VPS, kiểm tra log, rollback. |
| `/add-command` | Thêm/sửa slash command nhất quán. |
| `/testing` | Thêm và chạy test (Node built-in test runner). |
