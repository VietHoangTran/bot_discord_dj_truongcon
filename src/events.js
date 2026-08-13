// Đăng ký các sự kiện DisTube (thông báo vào text channel).
function registerDisTubeEvents(distube) {
  distube
    .on('playSong', (queue, song) => {
      queue.textChannel?.send(`🎶 Đang phát: **${song.name}** - \`${song.formattedDuration}\``);
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
      queue.textChannel?.send('📭 Hết bài trong hàng chờ.');
    });
}

module.exports = { registerDisTubeEvents };
