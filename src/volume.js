// Lưu âm lượng theo guild (mặc định 100). Volume áp dụng cho toàn bộ bot trong
// guild, không reset theo từng bài/queue. DisTube mặc định 50 và reset về 50 mỗi
// khi tạo queue mới -> ta tự quản lý state ở đây và áp lại khi queue được tạo
// (sự kiện initQueue trong events.js).
const DEFAULT_VOLUME = 100;

const guildVolumes = new Map();

function getVolume(guildId) {
  return guildVolumes.get(guildId) ?? DEFAULT_VOLUME;
}

function setVolume(guildId, level) {
  guildVolumes.set(guildId, level);
}

module.exports = { DEFAULT_VOLUME, getVolume, setVolume };
