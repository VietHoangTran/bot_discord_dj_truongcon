// Đăng ký các sự kiện DisTube (thông báo vào text channel).
const { buildNowPlayingEmbed, attachNowPlayingControls } = require('./nowPlaying');

function registerDisTubeEvents(distube) {
  distube
    .on('playSong', (queue, song) => {
      // Gửi embed "đang phát" + nút bấm. Nếu đã có message đang phát cho guild
      // này thì edit lại thay vì gửi mới (tránh spam khi đổi bài liên tục).
      const channel = queue.textChannel;
      if (!channel) return;

      if (queue.nowPlayingMessage) {
        queue.nowPlayingMessage
          .edit({ embeds: [buildNowPlayingEmbed(queue)] })
          .catch(() => {});
        return;
      }

      channel
        .send({ embeds: [buildNowPlayingEmbed(queue)] })
        .then((msg) => {
          queue.nowPlayingMessage = msg;
          attachNowPlayingControls(msg, queue, distube);
        })
        .catch(() => {});
    })
    .on('addSong', (queue, song) => {
      queue.textChannel?.send(`✅ Đã thêm vào hàng chờ: **${song.name}**`);
    })
    .on('addList', (queue, playlist) => {
      queue.textChannel?.send(
        `📃 Đã thêm playlist: **${playlist.name}** (${playlist.songs.length} bài) vào hàng chờ.`,
      );
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
      // Dọn tham chiếu message "đang phát" khi hết bài để không giữ embed cũ.
      queue.nowPlayingMessage = undefined;
      queue.textChannel?.send('📭 Hết bài trong hàng chờ.');
    });
}

module.exports = { registerDisTubeEvents };
