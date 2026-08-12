# 🎵 Discord Music Bot

Bot Discord phát nhạc từ **YouTube** và **SoundCloud**, xây dựng bằng **Node.js + discord.js v14 + DisTube**. Hỗ trợ slash commands, phù hợp cho bot cá nhân/server nhỏ.

## ✨ Tính năng

- ▶️ `/play <tên bài hát hoặc link>` — phát nhạc từ YouTube hoặc SoundCloud
  - Nhập **URL YouTube/SoundCloud** → phát trực tiếp bài/playlist đó
  - Nhập **tên bài hát** → tự tìm kiếm trên YouTube
- ⏭️ `/skip` — bỏ qua bài hiện tại
- ⏹️ `/stop` — dừng nhạc và rời voice channel
- ⏸️ `/pause` — tạm dừng bài hát
- ▶️ `/resume` — phát tiếp bài đang tạm dừng
- 📜 `/queue` — xem danh sách hàng chờ

## 🛠️ Công nghệ

| Package | Vai trò |
|---------|---------|
| discord.js | Giao tiếp với Discord API |
| @discordjs/voice | Join voice channel, phát audio |
| @discordjs/opus | Encode audio đúng chuẩn Discord |
| distube | Xử lý sẵn queue, play/skip/stop |
| @distube/ytdl-core | Lấy stream nhạc từ YouTube |
| @distube/soundcloud | Phát nhạc từ SoundCloud (URL track/playlist) |
| dotenv | Đọc biến môi trường từ .env |
| ffmpeg-static | Backup binary FFmpeg |

## 📋 Yêu cầu

- **Node.js** v18+ (khuyến nghị v20 LTS)
- **FFmpeg** (cài qua hệ điều hành, không chỉ qua npm)

## 🚀 Cài đặt

### 1. Clone & cài dependencies

```bash
git clone git@github.com:VietHoangTran/bot_discord_vince.git
cd bot_discord_vince
npm install
```

### 2. Tạo bot trên Discord Developer Portal

1. Vào [Discord Developer Portal](https://discord.com/developers/applications)
2. **New Application** → đặt tên bot
3. Vào tab **Bot**:
   - **Reset Token** → copy Bot Token
   - Bật **MESSAGE CONTENT INTENT** và **SERVER MEMBERS INTENT**
4. Vào tab **OAuth2 → URL Generator**:
   - Scopes: tick `bot` và `applications.commands`
   - Bot Permissions: tick `Connect`, `Speak`, `Send Messages`, `Use Slash Commands`, `Embed Links`
   - Copy URL sinh ra, mở trên trình duyệt để invite bot vào server

### 3. Cấu hình `.env`

Tạo file `.env` (hoặc sửa file có sẵn):

```env
DISCORD_TOKEN=dán_bot_token_ở_đây
CLIENT_ID=dán_application_id_ở_đây
GUILD_ID=id_server_test_của_bạn
```

- `CLIENT_ID`: lấy ở tab **General Information**
- `GUILD_ID`: bật **Developer Mode** trong Discord (Cài đặt → Advanced) → chuột phải server → **Copy Server ID**

> **Về GUILD_ID:** Biến này chỉ dùng khi **đăng ký slash commands** (chạy `npm run deploy`), **không giới hạn bot tham gia server**. Bot vào server nào tùy lúc bạn invite.
> - **Có GUILD_ID** → lệnh `/play` chỉ đăng ký vào 1 server đó (hiện ngay, dùng để test)
> - **Bỏ trống GUILD_ID** → lệnh đăng ký **global** (hiện ở mọi server bot tham gia, nhưng mất tới 1 giờ cập nhật)
> - Muốn bot dùng cho nhiều server → sau khi test OK, xóa/bỏ trống `GUILD_ID` rồi chạy lại `npm run deploy` để đăng ký global.

### 4. Đăng ký slash commands & chạy bot

```bash
npm run deploy   # đăng ký slash commands (chạy lại khi thêm/sửa command)
npm start        # chạy bot
```

Vào Discord, gõ `/play tên bài hát` trong kênh text để test.

## ☁️ Deploy lên Railway (nhanh nhất, chạy 24/7)

> Đặc biệt hữu ích nếu máy dev bị VPN/firewall chặn UDP voice của Discord — server Railway ở datacenter nên UDP không bị chặn.

### 1. Chuẩn bị
- Đã push code lên GitHub repo
- Đã có sẵn file `Dockerfile` + `railway.json` trong repo

### 2. Tạo project trên Railway
1. Vào [railway.app](https://railway.app) → đăng nhập bằng GitHub
2. **New Project** → **Deploy from GitHub repo** → chọn repo `bot_discord_vince`
3. Railway tự nhận `Dockerfile` và build

### 3. Cấu hình biến môi trường
Trong dashboard Railway → tab **Variables** → thêm:
```
DISCORD_TOKEN = <bot token>
CLIENT_ID     = 1537119940362899516
GUILD_ID      = <id server test>   ← có thể bỏ qua nếu đã đăng ký global commands
```
> **GUILD_ID trên Railway:** Chỉ cần thiết nếu bạn muốn chạy `deploy-commands.js` trên Railway (đăng ký guild command). Nếu đã đăng ký **global commands** (xem phần "Về GUILD_ID" ở trên) thì **bỏ GUILD_ID** — lệnh sẽ dùng được ở mọi server bot tham gia.
> ⚠️ **Quan trọng:** nếu trước đó đã chạy `npm run deploy` để đăng ký slash commands, các lệnh đã được đăng ký rồi → **không cần chạy lại `deploy` trên Railway**.

### 4. Deploy & xem log
- Railway tự build + deploy khi có biến môi trường
- Tab **Deployments** → xem log, chờ dòng `Bot đã online: ...`
- Bot online → vào Discord test `/play`

### Đăng ký slash commands (nếu chưa)
Railway chạy container bot chứ không chạy `deploy-commands.js` tự động. 2 cách:
- **Cách 1 (đơn giản):** chạy `npm run deploy` trên **máy dev** (1 lần) trước khi deploy lên Railway — lệnh đăng ký vào server, không phụ thuộc bot chạy ở đâu.
- **Cách 2:** trong dashboard Railway → **Settings → Start Command** tạm đổi thành `node src/deploy-commands.js && node src/index.js` (chạy 1 lần để đăng ký, rồi đổi lại `node src/index.js`).

### Lưu ý về Railway
- **Free trial**: ~$5 credit / 500 giờ dùng thử (bot idle tốn rất ít, test được nhiều tuần)
- Hết trial → cần gói Hobby ($5/tháng) để tiếp tục
- Bot Discord music cần FFmpeg + opus → `Dockerfile` đã cài sẵn

---

## 🖥️ Deploy lên VPS chạy 24/7

Cấu hình VPS gợi ý: **1 vCPU, 1GB RAM, 10GB SSD**.

```bash
# Upload code lên VPS
git clone git@github.com:VietHoangTran/bot_discord_vince.git
cd bot_discord_vince
npm install

# Nhớ tạo lại file .env trực tiếp trên VPS (không commit .env lên Git)

# Chạy bot bền vững với PM2
npm install -g pm2
pm2 start src/index.js --name music-bot
pm2 save
pm2 startup   # copy lệnh nó in ra và chạy để bot tự khởi động lại khi VPS reboot
```

Các lệnh quản lý hữu ích:

```bash
pm2 logs music-bot      # xem log
pm2 restart music-bot   # khởi động lại
pm2 stop music-bot      # dừng
```

## 🐛 Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|------------|
| Bot join voice nhưng không có tiếng | Thiếu FFmpeg hoặc @discordjs/opus | `sudo apt install ffmpeg`, kiểm tra `npm list @discordjs/opus` |
| Lỗi 403/410 khi play | YouTube đổi cơ chế chống bot | `npm update @distube/ytdl-core distube`, hoặc thử `play-dl` |
| Slash command không hiện | Chưa chạy deploy-commands.js | Chạy lại `npm run deploy` |
| Missing Access / bot không join được voice | Thiếu quyền Connect/Speak | Kiểm tra lại quyền của role bot trong server |

## 📁 Cấu trúc project

```
bot_discord_vince/
├── src/
│   ├── index.js            # File chính: client + slash commands + sự kiện DisTube
│   └── deploy-commands.js  # Đăng ký slash commands
├── .env                    # Token (không commit lên Git)
├── .gitignore
└── package.json
```

## 📄 License

MIT
