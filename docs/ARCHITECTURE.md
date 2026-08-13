# 🏗️ Kiến trúc

Tổng quan kiến trúc hiện tại của bot Discord music. Xem [`DECISIONS.md`](DECISIONS.md) để biết lý do đằng sau các lựa chọn.

## Cấu trúc code

```
bot_discord_vince/
├── src/
│   ├── index.js            # Entry mỏng: khởi tạo client + distube, login
│   ├── config.js           # Đọc + parse biến môi trường (whitelist, cookies)
│   ├── utils.js            # Hàm thuần: làm sạch link YouTube, whitelist check (có test)
│   ├── distube.js          # Khởi tạo DisTube + plugins + ffmpeg args
│   ├── events.js           # Sự kiện DisTube (playSong, addSong, error, finish)
│   ├── handlers.js         # Xử lý slash commands (interactionCreate)
│   ├── commands.js         # Định nghĩa slash commands (dùng chung cho auto-register + deploy)
│   └── deploy-commands.js # Đăng ký slash commands thủ công (tùy chọn)
├── test/
│   └── utils.test.js       # Test cho src/utils.js (node --test)
├── patches/
│   └── @distube+yt-dlp+2.0.1.patch  # Patch @distube/yt-dlp (áp bởi patch-package)
├── docs/                   # Tài liệu phát triển (xem docs/README.md)
├── .claude/
│   └── skills/             # Skill tùy chỉnh (update-changelog, deploy, ...)
├── Dockerfile              # Build + chạy trên Railway
├── railway.json            # Cấu hình deploy Railway
└── package.json
```

## Luồng hoạt động

1. **Khởi động** (`src/index.js`): nạp `.env`, decode cookies YouTube (`YOUTUBE_COOKIES_B64` → `/app/cookies.txt`), khởi tạo `Client` (discord.js) + `DisTube` với plugins.
2. **Đăng ký commands**: khi `clientReady`, tự đăng ký slash commands — guild command nếu có whitelist, global nếu không.
3. **Xử lý lệnh** (`interactionCreate`): guard guild + whitelist + voice channel, rồi gọi `distube.play/skip/stop/pause/resume` hoặc đọc queue.
4. **Phát nhạc**: DisTube dùng `YtDlpPlugin` (binary `yt-dlp`) để resolve + lấy stream, `SoundCloudPlugin` cho SoundCloud, ffmpeg encode qua `@discordjs/voice`.

## Thành phần chính

### DisTube + plugins
- `DisTube` quản lý queue, play/skip/stop/pause/resume, sự kiện (`playSong`, `addSong`, `addList`, `error`, `finish`).
- `YtDlpPlugin({ update: false })` — **phải nằm cuối mảng plugins**. Dùng binary `yt-dlp` thay cho `@distube/ytdl-core` để né lỗi decipher YouTube. `update:false` tránh tự download từ GitHub lúc runtime (Railway hay 403/rate-limit).
- `SoundCloudPlugin` — phát URL track/playlist SoundCloud.
- `ffmpeg.args.input` — set `user_agent` + `referer` để tránh 403 khi nạp stream YouTube. **Lưu ý:** DisTube map key→`-key`, value phải là string (object, không phải array).

### Patch `@distube/yt-dlp` (`patches/@distube+yt-dlp+2.0.1.patch`)
Áp bởi `patch-package` (chạy trong `postinstall`). Sửa cả `dist/index.js` và `dist/index.mjs`:
1. Bỏ `noCallHome: true` (deprecated — warning in ra stdout làm hỏng `JSON.parse` → crash).
2. Thêm `extractorArgs: "youtube:player_client=tv,ios,mweb,android"` — xoay vòng player client để né decipher/bot block.
3. Thêm `cookies: process.env.YOUTUBE_COOKIES_FILE || "/app/cookies.txt"` — truyền cookies trực tiếp vào flags (config file không có tác dụng, xem `DECISIONS.md`).

> ⚠️ Khi tạo lại patch: đừng để patch-package capture việc xóa binary `bin/yt-dlp` (artifact local; `npm ci --ignore-scripts` không download binary trên Railway).

### Whitelist guild
- `ALLOWED_GUILD_IDS` (cách nhau dấu phẩy) giới hạn server bot hoạt động. Để trống = mọi server.
- Whitelist bật → đăng ký **guild command** (hiện ngay <1s, guild luôn cache, tránh lỗi "Unknown Guild"). Tắt → **global command** (mọi server, có thể chờ 1h).
- `guildCreate`/`guildDelete` log + đăng ký commands cho guild mới nếu trong whitelist.

## Biến môi trường

| Biến | Vai trò |
|------|---------|
| `DISCORD_TOKEN` | Token bot Discord (bắt buộc). |
| `CLIENT_ID` | Application ID, dùng khi đăng ký commands. |
| `ALLOWED_GUILD_IDS` | Whitelist guild (dấu phẩy). Trống = mọi server. |
| `YOUTUBE_COOKIES_B64` | Base64 của file `cookies.txt` (Netscape format) để bypass bot detection trên IP datacenter. |
| `YOUTUBE_COOKIES_FILE` | (tùy chọn) Đường dẫn file cookies, mặc định `/app/cookies.txt`. |
| `GUILD_ID` | (cũ, tương thích) Đăng ký vào 1 guild duy nhất. |

## Deploy

- **Railway**: `Dockerfile` + `railway.json`. Container chạy `node src/index.js`. Bot tự đăng ký commands khi start, nên không cần chạy `deploy-commands.js` riêng.
- **VPS**: `pm2 start src/index.js --name music-bot` (xem README).
- **Yêu cầu runtime**: Node 22+, FFmpeg (system), `@discordjs/opus`, sodium libs (`libsodium-wrappers`, `sodium-native`).
