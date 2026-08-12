require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');

// Khởi tạo libsodium cho mã hóa voice (tránh timeout 30s do thiếu encryptor)
require('libsodium-wrappers');

// Debug biến môi trường (an toàn: chỉ in độ dài, không in token)
const token = process.env.DISCORD_TOKEN;
console.log(`[ENV] DISCORD_TOKEN: ${token ? `có (độ dài ${token.length}, bắt đầu "${token.slice(0, 10)}...")` : 'THIẾU/RỖNG'}`);
console.log(`[ENV] CLIENT_ID: ${process.env.CLIENT_ID || 'THIẾU'}`);
console.log(`[ENV] GUILD_ID: ${process.env.GUILD_ID || 'không có (OK cho global)'}`);

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

// Bắt sự kiện voice connection toàn cục để debug
const { getVoiceConnections, VoiceConnectionStatus } = require('@discordjs/voice');
setInterval(() => {
  const conns = getVoiceConnections();
  conns.forEach((conn, guildId) => {
    console.log(`[VOICE] guild ${guildId}: state=${conn.state.status}`);
  });
}, 5000);

client.once('clientReady', () => {
  console.log(`Bot đã online: ${client.user.tag}`);
});

// Xử lý slash command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, member, options } = interaction;
  const voiceChannel = member.voice.channel;

  if (['play', 'skip', 'stop', 'pause', 'resume'].includes(commandName) && !voiceChannel) {
    return interaction.reply({ content: '⚠️ Bạn cần vào voice channel trước.', flags: 64 });
  }

  try {
    switch (commandName) {
      case 'play': {
        const query = options.getString('query');
        await interaction.deferReply();

        // Chẩn đoán voice channel
        console.log(`[DEBUG] Voice channel: id=${voiceChannel.id} name="${voiceChannel.name}" type=${voiceChannel.type}`);
        const botMember = await interaction.guild.members.fetchMe();
        const perms = voiceChannel.permissionsFor(botMember);
        console.log(`[DEBUG] Bot perms trong channel -> Connect: ${perms?.has('Connect')}, Speak: ${perms?.has('Speak')}, ViewChannel: ${perms?.has('ViewChannel')}`);

        if (voiceChannel.type === 13) {
          return interaction.editReply('❌ Bạn đang ở **Stage Channel**. Bot chỉ hoạt động với **Voice Channel** thường. Hãy tạo/đổi sang Voice Channel (mặc định) rồi thử lại.');
        }

        await distube.play(voiceChannel, query, {
          textChannel: interaction.channel,
          member,
        });
        await interaction.editReply(`🔎 Đang tìm: **${query}**`);
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
    let msg = '❌ Có lỗi xảy ra, thử lại sau.';
    if (err.errorCode === 'VOICE_CONNECT_FAILED') {
      msg = '❌ Bot không vào được voice channel. Kiểm tra bot có quyền **Connect** và **Speak** trong server (Server Settings → Roles → bot role), và bạn đang ở trong voice channel.';
    }
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
