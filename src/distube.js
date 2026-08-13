// Khởi tạo DisTube với plugins + ffmpeg args.
const { DisTube } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');

function createDisTube(client) {
  return new DisTube(client, {
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
          user_agent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
          referer: 'https://www.youtube.com/',
        },
      },
    },
  });
}

module.exports = { createDisTube };
