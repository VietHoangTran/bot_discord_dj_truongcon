// Giao diện "đang phát": embed hiển thị bài đang phát + sắp phát, kèm nút bấm
// điều khiển (previous / pause-resume / skip / stop). Ai trong voice channel
// cũng bấm được. Dùng API Queue object của DisTube v5 (queue.skip(), ...).

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Thời gian nút bấm còn hoạt động (ms) trước khi bị disable.
const CONTROLS_TTL = 15 * 60_000;

// Số bài hiển thị trong field "Sắp phát".
const UPCOMING_LIMIT = 5;

// Tạo embed "đang phát" từ queue. queue.songs[0] là bài đang phát.
function buildNowPlayingEmbed(queue) {
  const song = queue.songs[0];
  const upcoming = queue.songs.slice(1, 1 + UPCOMING_LIMIT);

  const embed = new EmbedBuilder()
    .setTitle('🎵 Đang phát')
    .setDescription(`**${song.name}** - \`${song.formattedDuration}\``)
    .setFooter({ text: `🔊 Âm lượng: ${queue.volume}` });

  if (song.thumbnail) embed.setThumbnail(song.thumbnail);

  const upcomingText = upcoming.length
    ? upcoming
        .map((s, i) => `${i + 1}. ${s.name} - \`${s.formattedDuration}\``)
        .join('\n')
    : 'Hết bài trong hàng chờ.';
  embed.addFields({ name: '⏭️ Sắp phát', value: upcomingText });

  return embed;
}

// Gắn nút bấm điều khiển vào message "đang phát" + collector xử lý.
function attachNowPlayingControls(message, queue, distube) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('np_prev').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('np_pause').setEmoji('⏯️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('np_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('np_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
  );

  message.edit({ embeds: [buildNowPlayingEmbed(queue)], components: [row] }).catch(() => {});

  const collector = message.createMessageComponentCollector({ time: CONTROLS_TTL });

  collector.on('collect', async (interaction) => {
    // Ai cũng bấm được, nhưng phải đang ở trong voice channel.
    const voiceChannel = message.guild?.voiceStates?.cache?.get(interaction.user.id)?.channel;
    if (!voiceChannel) {
      return interaction
        .reply({ content: '⚠️ Bạn cần vào voice channel để điều khiển nhạc.', flags: 64 })
        .catch(() => {});
    }

    try {
      switch (interaction.customId) {
        case 'np_prev':
          try {
            await queue.previous();
          } catch {
            // Không có bài trước -> giữ nguyên, chỉ deferUpdate.
          }
          break;
        case 'np_pause':
          if (queue.paused) await queue.resume();
          else await queue.pause();
          break;
        case 'np_skip':
          await queue.skip();
          break;
        case 'np_stop':
          await queue.stop();
          break;
      }
      await interaction.deferUpdate().catch(() => {});
    } catch (err) {
      console.error('[NOW PLAYING] Lỗi xử lý nút bấm:', err);
      interaction
        .reply({ content: '❌ Không thực hiện được thao tác.', flags: 64 })
        .catch(() => {});
    }
  });

  // Hết hạn -> disable hết nút để không bấm được nữa.
  collector.on('end', () => {
    const disabledRow = new ActionRowBuilder().addComponents(
      row.components.map((btn) => ButtonBuilder.from(btn).setDisabled(true)),
    );
    message.edit({ components: [disabledRow] }).catch(() => {});
  });
}

module.exports = { buildNowPlayingEmbed, attachNowPlayingControls, CONTROLS_TTL };
