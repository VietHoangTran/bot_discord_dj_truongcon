# Dockerfile cho Discord Music Bot (Railway / bất kỳ cloud nào)
# Dùng Node 20 LTS (ổn định với @discordjs/opus hơn Node 24)
FROM node:20-bookworm

# Cài FFmpeg hệ thống (bắt buộc để encode audio)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

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