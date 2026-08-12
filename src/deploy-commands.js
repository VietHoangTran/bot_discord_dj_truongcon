require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Phát nhạc từ YouTube hoặc SoundCloud (tên bài hát hoặc link)')
    .addStringOption(opt =>
      opt.setName('query').setDescription('Tên bài hát hoặc URL YouTube/SoundCloud').setRequired(true)),
  new SlashCommandBuilder().setName('skip').setDescription('Bỏ qua bài hiện tại'),
  new SlashCommandBuilder().setName('stop').setDescription('Dừng nhạc và rời voice channel'),
  new SlashCommandBuilder().setName('pause').setDescription('Tạm dừng bài hát'),
  new SlashCommandBuilder().setName('resume').setDescription('Phát tiếp bài đang tạm dừng'),
  new SlashCommandBuilder().setName('queue').setDescription('Xem danh sách hàng chờ'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const { CLIENT_ID, GUILD_ID } = process.env;

    if (GUILD_ID && GUILD_ID !== 'id_server_test_của_bạn') {
      // Guild command: lệnh chỉ hiện ở 1 server, áp dụng ngay lập tức (<1s). Dùng để test.
      console.log(`Đang đăng ký slash commands vào guild ${GUILD_ID} (guild command)...`);
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands },
      );
      console.log('✅ Đăng ký guild command thành công! Lệnh hiện ngay trong 1 server.');
    } else {
      // Global command: lệnh hiện ở TẤT CẢ server bot tham gia. Mất tới 1 giờ để Discord cập nhật.
      console.log('GUILD_ID chưa cấu hình → đăng ký global commands (áp dụng cho mọi server)...');
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands },
      );
      console.log('✅ Đăng ký global command thành công! Lệnh sẽ hiện trong mọi server (có thể chờ tới 1 giờ).');
    }
  } catch (error) {
    console.error(error);
  }
})();