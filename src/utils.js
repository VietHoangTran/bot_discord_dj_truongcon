// Các hàm thuần (pure) — không phụ thuộc Discord/DisTube/env, dễ test.
// Xem test/utils.test.js.

// Kiểm tra link có phải playlist YouTube thật không.
// Playlist thật: /playlist?list= hoặc list=PL/UU/FL/OL/LL/PU...
// &list=RD... (autoplay radio động) KHÔNG tính là playlist thật.
function isPlaylistLink(query) {
  return (
    /youtube\.com\/playlist\?list=/.test(query) ||
    /[?&]list=(PL|UU|FL|OL|LL|PU)[A-Za-z0-9_-]{10,}/.test(query)
  );
}

// Làm sạch link YouTube: bỏ tham số rác (?si=, &list=RD..., ?t=...) nhưng
// GIỮ nguyên link playlist thật để DisTube resolve toàn bộ danh sách.
// Trả về link đã sạch (hoặc query gốc nếu không phải link YouTube).
function cleanYouTubeLink(query) {
  if (isPlaylistLink(query)) return query;
  const ytMatch = query.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (ytMatch) return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
  return query;
}

// Parse chuỗi ALLOWED_GUILD_IDS (cách nhau dấu phẩy) thành mảng, trim + bỏ rỗng.
function parseGuildIds(str) {
  return (str || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

// Kiểm tra guild có được phép không. allowedIds rỗng = cho phép mọi server.
function isGuildAllowed(guildId, allowedIds) {
  return allowedIds.length === 0 || allowedIds.includes(guildId);
}

module.exports = { isPlaylistLink, cleanYouTubeLink, parseGuildIds, isGuildAllowed };
