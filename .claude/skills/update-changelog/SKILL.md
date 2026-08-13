---
name: update-changelog
description: Cập nhật docs/CHANGELOG.md với các thay đổi phát triển mới nhất. Dùng sau khi có thay đổi code đáng kể (feature, fix, breaking, chore lớn).
---

# Update Changelog

Cập nhật `docs/CHANGELOG.md` để ghi lại các thay đổi trong phiên làm việc này. Giúp dự án giữ được lịch sử phát triển để dễ scale và onboard.

## Các bước

1. **Đọc** `docs/CHANGELOG.md` để biết mục trên cùng và định dạng ngày hiện có.
2. **Xác định thay đổi** trong phiên này: `git diff`, `git log`, các file đã sửa/tạo.
3. **Thêm mục mới** lên đầu (hoặc gộp vào mục cùng ngày nếu đã có) theo đúng định dạng hiện có.
4. **Phân loại** thay đổi:
   - **Features** — tính năng mới.
   - **Fixes** — sửa lỗi.
   - **Breaking** — thay đổi phá vỡ tương thích.
   - **Chore** — dọn dẹp, build, cấu hình, patch.
5. **Giữ mục ngắn gọn**, viết **tiếng Việt** (nhất quán với docs hiện có).
6. Nếu thay đổi ảnh hưởng **kiến trúc** → cập nhật thêm `docs/ARCHITECTURE.md`.
7. Nếu có **quyết định kỹ thuật** quan trọng → thêm vào `docs/DECISIONS.md` (định dạng ADR).

## Lưu ý

- Chỉ ghi các thay đổi **đáng kể** (feature, fix, breaking, chore lớn) — không ghi từng dòng sửa nhỏ.
- Không ghi lại những gì git history đã ghi rõ; changelog là **bản tóm tắt theo chủ đề**, không phải bản sao commit.
