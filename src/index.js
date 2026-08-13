require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { commandsJSON } = require('./commands');

// Khởi tạo libsodium cho mã hóa voice (tránh timeout 30s do thiếu encryptor)
require('libsodium-wrappers');

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
  // YtDlpPlugin phải nằm CUỐI mảng plugins (theo docs). Dùng binary yt-dlp
  // (đã có sẵn trong /usr/local/bin hoặc PATH) thay cho @distube/ytdl-core để
  // né lỗi decipher của YouTube. update:false -> không tự download từ GitHub
  // lúc runtime (Railway hay bị rate-limit/403).
  plugins: [new SoundCloudPlugin(), new YtDlpPlugin({ update: false })],
  // ffmpeg input args: set user-agent + referer khi nạp stream từ YouTube,
  // tránh bị 403/blocked khiến ffmpeg thoát (FFMPEG_EXITED) trên Railway.
  // DisTube map key->`-key` (không có dấu `-` ở key), value là string.
  ffmpeg: {
    args: {
      input: {
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        referer: 'https://www.youtube.com/',
      },
    },
  },
});

client.once('clientReady', async () => {
  console.log(`Bot đã online: ${client.user.tag}`);
  // Tự đăng ký slash commands global (hiện ở TẤT CẢ server bot tham gia).
  // Nếu set GUILD_ID trong .env, đăng ký vào 1 server đó (áp dụng ngay, dùng để test).
  // Global command có thể mất tới 1h để Discord cập nhật ở server mới.
  try {
    const { GUILD_ID } = process.env;
    if (GUILD_ID) {
      await client.application.commands.set(commandsJSON, GUILD_ID);
      console.log(`✅ Đã đăng ký guild commands vào ${GUILD_ID}`);
    } else {
      await client.application.commands.set(commandsJSON);
      console.log('✅ Đã đăng ký global commands (mọi server)');
    }
  } catch (err) {
    console.error('❌ Lỗi đăng ký slash commands:', err);
  }
});

// Xử lý slash command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, member, options } = interaction;
  console.log(`[CMD] /${commandName} từ ${member?.user?.tag ?? '?'} trong ${interaction.guild?.name ?? '?'}`);

  // Guard: interaction phải đến từ guild và có member (tránh crash khi dùng
  // trong DM hoặc guild chưa cache member -> member undefined).
  if (!interaction.inGuild() || !member) {
    return interaction.reply({ content: '⚠️ Lệnh này chỉ dùng được trong server.', flags: 64 }).catch(() => {});
  }

  const voiceChannel = member.voice.channel;

  if (['play', 'skip', 'stop', 'pause', 'resume'].includes(commandName) && !voiceChannel) {
    return interaction.reply({ content: '⚠️ Bạn cần vào voice channel trước.', flags: 64 }).catch(() => {});
  }

  try {
    switch (commandName) {
      case 'play': {
        const query = options.getString('query');
        await interaction.deferReply();

        if (voiceChannel.type === 13) {
          return interaction.editReply('❌ Bạn đang ở **Stage Channel**. Bot chỉ hoạt động với **Voice Channel** thường. Hãy tạo/đổi sang Voice Channel (mặc định) rồi thử lại.');
        }

        // Làm sạch link YouTube (bỏ tham số ?si=, &list=RD..., &start_radio=, ?t=...)
        let cleanQuery = query;
        const ytMatch = query.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
        if (ytMatch) {
          cleanQuery = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
          console.log(`[PLAY] Link làm sạch: ${query} -> ${cleanQuery}`);
        }

        await distube.play(voiceChannel, cleanQuery, {
          textChannel: interaction.channel,
          member,
        });
        await interaction.editReply(`🔎 Đang tìm: **${cleanQuery}**`);
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

      default:
        // Lệnh không nhận diện (vd: global command chưa propagate xong) -> vẫn reply.
        await interaction.reply('⚠️ Lệnh chưa sẵn sàng, thử lại sau ít phút.');
    }
  } catch (err) {
    console.error('[CMD ERROR]', err);
    let msg = '❌ Có lỗi xảy ra, thử lại sau.';
    if (err.errorCode === 'VOICE_CONNECT_FAILED') {
      msg = '❌ Bot không vào được voice channel. Kiểm tra bot có quyền **Connect** và **Speak** trong server (Server Settings → Roles → bot role), và bạn đang ở trong voice channel.';
    } else if (err.errorCode === 'NOT_SUPPORTED_URL') {
      msg = '❌ URL không được hỗ trợ. Dùng **link YouTube** hoặc **link SoundCloud**, hoặc nhập **tên bài hát** để tìm kiếm trên YouTube.';
    } else if (err.errorCode === 'NO_RESULT') {
      msg = '❌ Không tìm thấy bài hát nào khớp với từ khóa. Thử lại với tên hoặc link khác.';
    } else if (err.errorCode === 'NO_RELATED_VIDEO') {
      msg = '❌ Không tìm được bài liên quan để autoplay.';
    }
    interaction.deferred ? interaction.editReply(msg).catch(() => {}) : interaction.reply({ content: msg, flags: 64 }).catch(() => {});
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
  .on('error', (error, queue, song) => {
    console.error('[DisTube error]', error);
    const textChannel = queue?.textChannel;
    const name = song?.name ? ` **${song.name}**` : '';
    let msg = `❌ Lỗi khi phát nhạc${name}.`;
    // FFMPEG_EXITED thường do stream URL hết hạn (yt-dlp token có TTL) hoặc
    // format không phát được -> gợi ý thử lại.
    if (error?.errorCode === 'FFMPEG_EXITED') {
      msg = `❌ Lỗi stream khi phát${name}. Link có thể hết hạn — thử \`/play\` lại.`;
    }
    textChannel?.send(msg).catch(() => {});
  })
  .on('finish', (queue) => {
    queue.textChannel?.send('📭 Hết bài trong hàng chờ.');
  });

// Bắt lỗi để bot không crash: nếu interaction handler hoặc sự kiện nào đó
// ném lỗi không được await, log thay vì để process thoát.
client.on('error', (err) => console.error('[client error]', err));
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));

client.login(process.env.DISCORD_TOKEN);
