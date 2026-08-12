require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  nsfw: false,
  plugins: [new SoundCloudPlugin()],
});

client.once('ready', () => {
  console.log(`Bot đã online: ${client.user.tag}`);
});

// Xử lý slash command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, member, options } = interaction;
  const voiceChannel = member.voice.channel;

  if (['play', 'skip', 'stop', 'pause', 'resume'].includes(commandName) && !voiceChannel) {
    return interaction.reply({ content: '⚠️ Bạn cần vào voice channel trước.', ephemeral: true });
  }

  try {
    switch (commandName) {
      case 'play': {
        const query = options.getString('query');
        await interaction.deferReply();
        await distube.play(voiceChannel, query, {
          textChannel: interaction.channel,
          member,
        });
        await interaction.editReply(`🔎 Đang tìm: **${query}**`); // Tự nhận diện YouTube/SoundCloud qua URL, hoặc tìm kiếm trên YouTube nếu chỉ nhập tên
        break;
      }

      case 'skip':
        distube.skip(interaction);
        await interaction.reply('⏭️ Đã bỏ qua bài hiện tại.');
        break;

      case 'stop':
        distube.stop(interaction);
        await interaction.reply('⏹️ Đã dừng nhạc.');
        break;

      case 'pause':
        distube.pause(interaction);
        await interaction.reply('⏸️ Đã tạm dừng.');
        break;

      case 'resume':
        distube.resume(interaction);
        await interaction.reply('▶️ Tiếp tục phát.');
        break;

      case 'queue': {
        const queue = distube.getQueue(interaction);
        if (!queue) return interaction.reply('📭 Hàng chờ đang trống.');
        const list = queue.songs
          .map((song, i) => `${i === 0 ? '🎵' : `${i}.`} ${song.name} - \`${song.formattedDuration}\``)
          .slice(0, 10)
          .join('\n');
        const embed = new EmbedBuilder().setTitle('Hàng chờ phát nhạc').setDescription(list);
        await interaction.reply({ embeds: [embed] });
        break;
      }
    }
  } catch (err) {
    console.error(err);
    const msg = '❌ Có lỗi xảy ra, thử lại sau.';
    interaction.deferred ? interaction.editReply(msg) : interaction.reply(msg);
  }
});

// Sự kiện DisTube
distube
  .on('playSong', (queue, song) => {
    queue.textChannel?.send(`🎶 Đang phát: **${song.name}** - \`${song.formattedDuration}\``);
  })
  .on('addSong', (queue, song) => {
    queue.textChannel?.send(`✅ Đã thêm vào hàng chờ: **${song.name}**`);
  })
  .on('error', (channel, error) => {
    console.error(error);
    channel?.send('❌ Lỗi khi phát nhạc, có thể video bị chặn hoặc private.');
  })
  .on('finish', (queue) => {
    queue.textChannel?.send('📭 Hết bài trong hàng chờ.');
  });

client.login(process.env.DISCORD_TOKEN);
