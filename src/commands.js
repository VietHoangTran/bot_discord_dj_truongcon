// Định nghĩa slash commands ở 1 chỗ duy nhất để index.js (auto-register) và
// deploy-commands.js (chạy thủ công) cùng dùng, tránh lệch định nghĩa.

const { SlashCommandBuilder } = require('discord.js');

const commandBuilders = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Phát nhạc từ YouTube hoặc SoundCloud (tên bài hát hoặc link)')
    .addStringOption((opt) =>
      opt
        .setName('query')
        .setDescription('Tên bài hát hoặc URL YouTube/SoundCloud')
        .setRequired(true),
    ),
  new SlashCommandBuilder().setName('skip').setDescription('Bỏ qua bài hiện tại'),
  new SlashCommandBuilder().setName('stop').setDescription('Dừng nhạc và rời voice channel'),
  new SlashCommandBuilder().setName('pause').setDescription('Tạm dừng bài hát'),
  new SlashCommandBuilder().setName('resume').setDescription('Phát tiếp bài đang tạm dừng'),
  new SlashCommandBuilder().setName('queue').setDescription('Xem danh sách hàng chờ'),
];

// Dạng JSON để gửi lên Discord API (REST.put cần mảng JSON).
const commandsJSON = commandBuilders.map((cmd) => cmd.toJSON());

module.exports = { commandBuilders, commandsJSON };