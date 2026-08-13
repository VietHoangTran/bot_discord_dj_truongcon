// Xử lý slash commands (interactionCreate). Nhận dependencies qua tham số để dễ test.
const { EmbedBuilder } = require('discord.js');
const { cleanYouTubeLink } = require('./utils');

// Các lệnh yêu cầu phải ở trong voice channel.
const VOICE_COMMANDS = ['play', 'skip', 'stop', 'pause', 'resume'];

function createInteractionHandler({ distube, isGuildAllowed }) {
  return async function handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    // Guard: phải đến từ guild (tránh crash trong DM).
    if (!interaction.inGuild()) {
      return interaction
        .reply({ content: '⚠️ Lệnh này chỉ dùng được trong server.', flags: 64 })
        .catch(() => {});
    }

    // Whitelist: chỉ guild trong ALLOWED_GUILD_IDS mới dùng được bot.
    if (!isGuildAllowed(interaction.guildId)) {
      console.log(
        `[CMD] /${commandName} bị từ chối: guild ${interaction.guildId} không trong whitelist`,
      );
      return interaction
        .reply({ content: '⚠️ Bot này không được phép chạy ở server này.', flags: 64 })
        .catch(() => {});
    }

    const { member } = interaction;
    console.log(
      `[CMD] /${commandName} từ ${member?.user?.tag ?? interaction.user?.tag ?? '?'} trong ${interaction.guild?.name ?? '?'}`,
    );

    if (!member) {
      return interaction
        .reply({ content: '⚠️ Không xác định được thành viên. Thử lại sau.', flags: 64 })
        .catch(() => {});
    }

    // Lấy voice channel an toàn: member.voice có thể undefined khi chưa cache voice
    // states. Fallback sang guild voiceStates cache.
    const voiceChannel =
      member?.voice?.channel ??
      interaction.guild?.voiceStates?.cache?.get(member.id)?.channel ??
      undefined;

    if (VOICE_COMMANDS.includes(commandName) && !voiceChannel) {
      return interaction
        .reply({ content: '⚠️ Bạn cần vào voice channel trước.', flags: 64 })
        .catch(() => {});
    }

    try {
      switch (commandName) {
        case 'play': {
          const query = options.getString('query');
          await interaction.deferReply();

          if (voiceChannel.type === 13) {
            return interaction.editReply(
              '❌ Bạn đang ở **Stage Channel**. Bot chỉ hoạt động với **Voice Channel** thường. Hãy tạo/đổi sang Voice Channel (mặc định) rồi thử lại.',
            );
          }

          const cleanQuery = cleanYouTubeLink(query);
          if (cleanQuery !== query) {
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
        msg =
          '❌ Bot không vào được voice channel. Kiểm tra bot có quyền **Connect** và **Speak** trong server (Server Settings → Roles → bot role), và bạn đang ở trong voice channel.';
      } else if (err.errorCode === 'NOT_SUPPORTED_URL') {
        msg =
          '❌ URL không được hỗ trợ. Dùng **link YouTube** hoặc **link SoundCloud**, hoặc nhập **tên bài hát** để tìm kiếm trên YouTube.';
      } else if (err.errorCode === 'NO_RESULT') {
        msg = '❌ Không tìm thấy bài hát nào khớp với từ khóa. Thử lại với tên hoặc link khác.';
      } else if (err.errorCode === 'NO_RELATED_VIDEO') {
        msg = '❌ Không tìm được bài liên quan để autoplay.';
      }
      interaction.deferred
        ? interaction.editReply(msg).catch(() => {})
        : interaction.reply({ content: msg, flags: 64 }).catch(() => {});
    }
  };
}

module.exports = { createInteractionHandler };
