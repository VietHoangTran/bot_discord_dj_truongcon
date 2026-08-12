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
    console.log('Đang đăng ký slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log('Đăng ký thành công!');
  } catch (error) {
    console.error(error);
  }
})();
