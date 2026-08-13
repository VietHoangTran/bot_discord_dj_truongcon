# Dockerfile cho Discord Music Bot (Railway / bất kỳ cloud nào)
# Dùng Node 22 (yêu cầu của @discordjs/voice 0.19 + distube 5.2)
FROM node:22-bookworm

# Cài FFmpeg hệ thống (bắt buộc để encode audio) + libsodium (mã hóa voice)
RUN apt-get update && apt-get install -y ffmpeg libsodium23 && rm -rf /var/lib/apt/lists/*

# Cài sẵn binary yt-dlp (standalone, không cần python) vào /usr/local/bin.
# YtDlpPlugin sẽ dùng binary này thay vì tự download (tránh lỗi 403 GitHub rate-limit).
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
      -o /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

# Trỏ @distube/yt-dlp tới binary hệ thống (trong /usr/local/bin/yt-dlp).
ENV YTDLP_DIR=/usr/local/bin
ENV YTDLP_FILENAME=yt-dlp

# Thư mục làm việc
WORKDIR /app

# Copy package files và cài dependencies.
# --ignore-scripts: bỏ postinstall của @distube/yt-dlp (cố download yt-dlp từ GitHub,
# bị Railway rate-limit/403). Binary yt-dlp đã có sẵn ở /usr/local/bin từ bước trên.
# Patch + opus rebuild chạy tường minh ở bước sau.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source code + patches (cần cho patch-package)
COPY . .

# Áp dụng patch cho @distube/yt-dlp: bỏ --no-call-home (đã bị yt-dlp mới deprecate,
# warning ra stdout làm hỏng JSON.parse -> crash bot). Xem patches/@distube+yt-dlp+2.0.1.patch
RUN npx patch-package

# Đảm bảo opus build đúng
RUN npm rebuild @discordjs/opus

# Chạy bot
CMD ["node", "src/index.js"]