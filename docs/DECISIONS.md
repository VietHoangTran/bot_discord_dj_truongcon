# 🧭 Quyết định kỹ thuật (ADR)

Các quyết định kỹ thuật quan trọng và lý do chọn chúng. Mỗi mục ghi: **Bối cảnh → Quyết định → Hệ quả**. Thêm mục mới khi có quyết định đáng kể.

---

## ADR-001: Thay `@distube/ytdl-core` bằng `@distube/yt-dlp`

**Ngày:** 2026-08-12

**Bối cảnh:** YouTube đổi player script mới (08/2026), `@distube/ytdl-core` chưa parse được decipher function (issue [#144](https://github.com/distubejs/ytdl-core/issues/144)) → `/play` báo `NOT_SUPPORTED_URL`.

**Quyết định:** Dùng `@distube/yt-dlp` (spawn binary `yt-dlp`) thay cho `@distube/ytdl-core`. Đặt `YtDlpPlugin` **cuối mảng plugins** (theo docs), `update: false` để không tự download binary lúc runtime.

**Hệ quả:** YouTube phát được trở lại. Nhưng binary `yt-dlp` cần có sẵn trong PATH (Dockerfile cài), và phải patch plugin để né bot detection (xem ADR-002).

---

## ADR-002: Patch `@distube/yt-dlp` (noCallHome, extractorArgs, cookies)

**Ngày:** 2026-08-13

**Bối cảnh:** Trên Railway (IP datacenter), YouTube chặn bot với "Sign in to confirm you're not a bot". Ngoài ra flag `--no-call-home` deprecated in warning ra stdout làm hỏng `JSON.parse` → bot crash.

**Quyết định:** Patch `@distube/yt-dlp` (qua `patch-package`, áp trong `postinstall`) để:
1. Bỏ `noCallHome: true`.
2. Thêm `extractorArgs: "youtube:player_client=tv,ios,mweb,android"` — xoay vòng player client.
3. Thêm `cookies` vào flags object.

**Hệ quả:** Bot né được bot detection trên datacenter. Patch phải được tái tạo cẩn thận (đừng capture việc xóa binary `bin/yt-dlp`). Xem chi tiết trong memory `yt-dlp-player-client-extractor-args`.

---

## ADR-003: Cookies phải truyền qua plugin flags, không qua config file

**Ngày:** 2026-08-13

**Bối cảnh:** Ban đầu viết `~/.config/yt-dlp/config` với `--cookies /app/cookies.txt`, nhưng cookies không bao giờ tới được yt-dlp.

**Quyết định:** `@distube/yt-dlp` spawn binary qua `dargs` từ flags object hard-coded — **không đọc** config file. Vì vậy phải thêm `cookies: process.env.YOUTUBE_COOKIES_FILE || "/app/cookies.txt"` vào flags object trong cả `resolve()` và `getStreamURL()` (qua patch ADR-002). `dargs` biến `cookies` → `--cookies=<path>`.

**Hệ quả:** Cookies thực sự được dùng. Xem chi tiết trong memory `yt-dlp-cookies-not-via-config-file`.

---

## ADR-004: Deploy lên Railway (Dockerfile + railway.json)

**Ngày:** 2026-08-12

**Bối cảnh:** Máy dev bị VPN/firewall chặn UDP voice của Discord → bot không phát được tiếng. Cần host 24/7.

**Quyết định:** Deploy lên Railway bằng `Dockerfile` + `railway.json`. Container chạy `node src/index.js`. Bot tự đăng ký commands khi start (không cần chạy `deploy-commands.js` riêng).

**Hệ quả:** Bot chạy ổn định trên datacenter (UDP không bị chặn). Nhưng IP datacenter bị YouTube chặn → cần cookies (ADR-002/003). Railway build cần skip yt-dlp postinstall download (`npm ci --ignore-scripts`).

---

## ADR-005: Whitelist guild qua `ALLOWED_GUILD_IDS`

**Ngày:** 2026-08-13

**Bối cảnh:** Bot cần giới hạn chỉ hoạt động ở server được phép, và tránh lỗi "Unknown Guild" / "cần vào voice" do guild không được cache.

**Quyết định:** Thêm `ALLOWED_GUILD_IDS` (dấu phẩy). Khi bật → đăng ký **guild command** (hiện ngay <1s, guild luôn cache). Khi tắt → **global command**. `guildCreate`/`guildDelete` log + đăng ký commands cho guild mới trong whitelist.

**Hệ quả:** Bot chỉ hoạt động ở server được phép, lệnh hiện tức thì, giảm lỗi guild không cache.

---

## ADR-006: Hỗ trợ YouTube playlist trong `/play`

**Ngày:** 2026-08-13

**Bối cảnh:** Link YouTube có tham số rác (`?si=`, `&list=RD...`, `?t=...`) gây `NOT_SUPPORTED_URL`. Nhưng link playlist thật cần giữ nguyên để DisTube resolve toàn bộ.

**Quyết định:** Làm sạch link YouTube (bỏ tham số rác) **trừ khi** là playlist thật (`/playlist?list=` hoặc `list=PL/UU/FL/OL/LL/PU...`). `&list=RD...` (autoplay radio động) vẫn strip.

**Hệ quả:** Cả video lẫn playlist YouTube đều phát được. Playlist fail trên IP datacenter được xử lý bằng cách tolerate yt-dlp exit code khác 0.
