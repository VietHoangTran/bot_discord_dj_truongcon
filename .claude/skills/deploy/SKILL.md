---
name: deploy
description: Quy trình deploy bot lên Railway hoặc VPS (build, biến môi trường, kiểm tra log, rollback). Dùng khi cần deploy hoặc xử lý lỗi deploy.
---

# Deploy

Quy trình deploy bot lên **Railway** (chính) hoặc **VPS** (PM2). Xem `docs/ARCHITECTURE.md` để biết biến môi trường.

## Deploy lên Railway

1. **Push code** lên GitHub (`git push origin main`).
2. Railway tự build `Dockerfile` + deploy (cấu hình trong `railway.json`).
3. **Kiểm tra log** (tab Deployments): chờ dòng `Bot đã online: ...`.
4. **Biến môi trường** (tab Variables) — cần có:
   - `DISCORD_TOKEN` (bắt buộc)
   - `CLIENT_ID`
   - `ALLOWED_GUILD_IDS` (whitelist, trống = mọi server)
   - `YOUTUBE_COOKIES_B64` (cookies YouTube, cần cho IP datacenter)
5. Bot **tự đăng ký commands** khi start → không cần chạy `deploy-commands.js` riêng.

### Rollback Railway
- Tab **Deployments** → chọn deployment cũ → **Redeploy**.

## Deploy lên VPS (PM2)

```bash
git clone git@github.com:VietHoangTran/bot_discord_vince.git
cd bot_discord_vince
npm install
# Tạo file .env (không commit lên git)
npm install -g pm2
pm2 start src/index.js --name music-bot
pm2 save
pm2 startup   # copy lệnh in ra và chạy để tự khởi động khi reboot
```

Quản lý: `pm2 logs music-bot`, `pm2 restart music-bot`, `pm2 stop music-bot`.

### Rollback VPS
```bash
git checkout <commit-cũ>
npm install
pm2 restart music-bot
```

## Lưu ý

- **Yêu cầu runtime:** Node 22+, FFmpeg (system), `@discordjs/opus`, sodium libs.
- **Patch yt-dlp:** `npm ci --ignore-scripts` + `npx patch-package` (đã có trong Dockerfile). Đừng để patch-package capture việc xóa binary `bin/yt-dlp`.
- **Lỗi thường gặp:** "Sign in to confirm you're not a bot" → thiếu `YOUTUBE_COOKIES_B64`; voice không có tiếng → thiếu FFmpeg/opus.
