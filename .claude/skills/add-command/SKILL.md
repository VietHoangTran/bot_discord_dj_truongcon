---
name: add-command
description: Quy trình thêm hoặc sửa slash command cho bot (sửa commands.js, xử lý trong index.js, deploy, test). Dùng khi thêm tính năng lệnh mới.
---

# Add Command

Quy trình thêm/sửa slash command. **`src/commands.js` là nguồn duy nhất** định nghĩa commands — dùng chung cho auto-register (index.js) và deploy-commands.js, tránh lệch định nghĩa.

## Các bước

### 1. Định nghĩa command trong `src/commands.js`
Thêm `SlashCommandBuilder` vào mảng `commandBuilders`:
```js
new SlashCommandBuilder()
  .setName('tên-lệnh')
  .setDescription('Mô tả ngắn')
  .addStringOption((opt) => opt.setName('query').setDescription('...').setRequired(true)),
```

### 2. Xử lý trong `src/index.js`
Thêm `case` vào `switch (commandName)` trong `interactionCreate`, theo pattern hiện có:
- Guard guild + whitelist + voice channel (đã có sẵn ở đầu handler).
- Dùng `interaction.deferReply()` cho lệnh chậm (vd: play).
- Bắt lỗi với `err.errorCode` (VOICE_CONNECT_FAILED, NOT_SUPPORTED_URL, NO_RESULT...).

### 3. Deploy
- Bot **tự đăng ký commands** khi restart → chỉ cần restart bot.
- Hoặc chạy thủ công: `npm run deploy` (đăng ký guild/global theo `ALLOWED_GUILD_IDS`).

### 4. Test trong Discord
- Vào voice channel → gõ `/tên-lệnh` → kiểm tra phản hồi.
- Test cả trường hợp lỗi (không vào voice, guild không trong whitelist, query rỗng).

## Lưu ý

- **Không sửa lệch** giữa `commands.js` và `deploy-commands.js` — cả hai đều import từ `commands.js`.
- Lệnh mới cần **guard voice channel** nếu là lệnh phát nhạc (thêm vào mảng `['play','skip',...]`).
- Sau khi thêm command đáng kể → cập nhật `docs/CHANGELOG.md` (gọi `/update-changelog`).
