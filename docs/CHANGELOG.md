# 📜 Changelog

Log phát triển của dự án theo thời gian — **mới nhất ở trên**. Mỗi mục gom các thay đổi cùng chủ đề trong một ngày.

---

## 2026-08-13 (refactor src)

### Chore
- **Chia module `src/`** — tách `index.js` (~280 dòng) thành: `config.js` (env), `utils.js` (hàm thuần), `distube.js` (DisTube setup), `events.js` (sự kiện DisTube), `handlers.js` (slash commands). `index.js` giờ chỉ là entry mỏng.
- **Thêm test** — `test/utils.test.js` (7 test) cho logic thuần: làm sạch link YouTube, parse whitelist, whitelist check. Chạy bằng `npm test` (`node --test`).

---

## 2026-08-13 (docs & tooling)

### Chore
- **Tái cấu trúc docs** — thay file `.docx` cũ bằng thư mục `docs/` (CHANGELOG, ARCHITECTURE, DECISIONS) để lưu quá trình phát triển, dễ scale.
- **Thêm skill phát triển** — `update-changelog`, `commit-message`, `deploy`, `add-command`, `testing` (trong `.claude/skills/`).
- **Thêm hook tự động** nhắc cập nhật CHANGELOG khi có thay đổi file nguồn.
- **Bảo mật** — bỏ track `.claude/settings.json` (từng lộ token) + thêm vào `.gitignore`.
- **Thêm script `test`** (`node --test`) vào `package.json`.

---

## 2026-08-13

### Features
- **Hỗ trợ YouTube playlist** trong `/play` — nhập link playlist sẽ xếp toàn bộ bài hát vào queue.
- **Whitelist guild** qua biến môi trường `ALLOWED_GUILD_IDS` — bot chỉ hoạt động trong các server được phép.
- **Cookies YouTube** qua `YOUTUBE_COOKIES_B64` — decode ra `/app/cookies.txt` lúc khởi động để bypass bot detection.
- **Tự đăng ký slash commands** (global) khi bot khởi động — không cần chạy `npm run deploy` riêng.

### Fixes
- **Playlist fail trên IP datacenter**: tolerate yt-dlp exit code khác 0 (Railway).
- **Truyền cookies trực tiếp vào plugin flags** của `@distube/yt-dlp` — trước đây viết config file không có tác dụng (xem `DECISIONS.md`).
- **Bypass YouTube bot detection** bằng multi-client fallback + `player_client=android`.
- **Fix crash** khi voice channel undefined (optional chaining), guard mọi đường reply, guard `interactionCreate` khi member undefined, thêm global error handlers.
- **Fix "application did not respond"** — guard tất cả reply paths + log.
- **Fix `ffmpeg.args.input`** — phải là object (key→value), không phải array.
- **Fix DisTube 5 error handler signature** + thêm ffmpeg user-agent.
- **Fix "Unknown Guild"** — fetch guild + member qua REST khi không có trong cache, retry + debug logging, log guilds cache + `guildCreate`/`guildDelete`.

### Chore
- **Patch `@distube/yt-dlp`**: bỏ flag `--no-call-home` deprecated (gây crash khi parse JSON), thêm `extractorArgs` + `cookies` (xem `DECISIONS.md`).
- **Fix Railway build**: skip yt-dlp postinstall download.
- Dọn debug code, thêm player-script files vào `.gitignore`.

---

## 2026-08-12

### Features
- **Khởi tạo bot** Discord music (discord.js v14 + DisTube).
- **Hỗ trợ SoundCloud** playback (URL track/playlist).
- **Deploy Railway** — thêm `Dockerfile` + `railway.json`.
- **Đăng ký slash commands** cả guild lẫn global.

### Fixes
- **Fix voice timeout** — thêm sodium encryption libs (`libsodium-wrappers`, `sodium-native`) + voice debug.
- **Fix Railway build** — Node 22 + bỏ `ffmpeg-static` (dùng system ffmpeg).
- **Update `@discordjs/voice`** lên 0.19.2 + thêm `sodium-native`.
- **Fix NOT_SUPPORTED_URL** — làm sạch link YouTube trước khi truyền vào DisTube.
- **Thay `ytdl-core` bằng `@distube/yt-dlp`** để fix YouTube decipher (xem `DECISIONS.md`).

### Chore
- Enable DEBUG logging cho `@discordjs/voice` + distube.
- Debug env vars an toàn lúc khởi động (chỉ in độ dài, không lộ token).
- Dọn debug code + cải thiện error messages.
