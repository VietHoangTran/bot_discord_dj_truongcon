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

# Báo cho @distube/yt-dlp dùng binary hệ thống, KHÔNG download lúc npm ci
ENV YTDLP_DISABLE_DOWNLOAD=true
ENV YTDLP_DIR=/usr/local/bin
ENV YTDLP_FILENAME=yt-dlp

# Thư mục làm việc
WORKDIR /app

# Copy package files và cài dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Đảm bảo opus build đúng
RUN npm rebuild @discordjs/opus

# Chạy bot
CMD ["node", "src/index.js"]