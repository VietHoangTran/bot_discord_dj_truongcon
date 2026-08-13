// Đọc + parse biến môi trường. Gọi sau require('dotenv').config().
const fs = require('fs');
const path = require('path');
const { parseGuildIds, isGuildAllowed } = require('./utils');

// Cookies YouTube để né bot detection ở Railway (IP datacenter bị YouTube chặn
// "Sign in to confirm you're not a bot"). Truyền qua YOUTUBE_COOKIES_B64 =
// base64 của file cookies.txt (Netscape format, export từ browser đăng nhập
// tài khoản Google BURNER — KHÔNG dùng account chính). Startup decode ra
// /app/cookies.txt + ghi yt-dlp config file để binary tự load cookies.
const COOKIES_FILE = '/app/cookies.txt';

function loadCookies() {
  const cookiesB64 = process.env.YOUTUBE_COOKIES_B64;
  if (!cookiesB64) {
    console.warn(
      "⚠️ Không có YOUTUBE_COOKIES_B64 — YouTube có thể chặn bot trên IP datacenter (lỗi \"Sign in to confirm you're not a bot\").",
    );
    return;
  }
  try {
    fs.writeFileSync(COOKIES_FILE, Buffer.from(cookiesB64, 'base64'));
    const configDir = path.join(process.env.HOME || '/root', '.config', 'yt-dlp');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, 'config'), `--cookies ${COOKIES_FILE}\n`);
    console.log('✅ Đã nạp cookies YouTube (YOUTUBE_COOKIES_B64 -> /app/cookies.txt)');
  } catch (e) {
    console.error('❌ Lỗi ghi cookies.txt / yt-dlp config:', e.message);
  }
}

// Whitelist server: chỉ cho bot hoạt động ở các guild có ID trong ALLOWED_GUILD_IDS
// (cách nhau bởi dấu phẩy). Để trống = cho phép mọi server.
const ALLOWED_GUILD_IDS = parseGuildIds(process.env.ALLOWED_GUILD_IDS);
const whitelistEnabled = ALLOWED_GUILD_IDS.length > 0;
const isGuildAllowedFn = (guildId) => isGuildAllowed(guildId, ALLOWED_GUILD_IDS);

module.exports = {
  COOKIES_FILE,
  ALLOWED_GUILD_IDS,
  whitelistEnabled,
  isGuildAllowed: isGuildAllowedFn,
  loadCookies,
};
