// Script đăng ký slash commands thủ công (dùng khi cần re-register ngay).
// Bot cũng tự đăng ký khi start (xem src/index.js), nên thường không cần chạy file này.
//
// Cách dùng:
// - ALLOWED_GUILD_IDS=id1,id2  -> đăng ký guild command vào từng guild trong list
//   (lệnh hiện ngay <1s, guild luôn cache).
// - Để trống ALLOWED_GUILD_IDS  -> đăng ký global (mọi server, có thể chờ 1h).
// - GUILD_ID=... (cũ)          -> đăng ký vào 1 guild đó (giữ tương thích).

require('dotenv').config();

const { REST, Routes } = require('discord.js');
const { commandsJSON: commands } = require('./commands');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const { CLIENT_ID, GUILD_ID } = process.env;
    const allowedIds = (process.env.ALLOWED_GUILD_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (allowedIds.length > 0) {
      // Whitelist: đăng ký guild command vào từng guild được phép.
      for (const id of allowedIds) {
        console.log(`Đang đăng ký slash commands vào guild ${id}...`);
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, id), { body: commands });
        console.log(`✅ Đăng ký thành công vào ${id}`);
      }
    } else if (GUILD_ID && GUILD_ID !== 'id_server_test_của_bạn') {
      // Tương thích: đăng ký vào 1 guild duy nhất.
      console.log(`Đang đăng ký slash commands vào guild ${GUILD_ID} (guild command)...`);
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
      console.log('✅ Đăng ký guild command thành công! Lệnh hiện ngay trong 1 server.');
    } else {
      // Global: lệnh hiện ở TẤT CẢ server bot tham gia. Mất tới 1 giờ để Discord cập nhật.
      console.log('ALLOWED_GUILD_IDS/GUILD_ID chưa cấu hình → đăng ký global commands...');
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('✅ Đăng ký global command thành công! Lệnh sẽ hiện trong mọi server (có thể chờ tới 1 giờ).');
    }
  } catch (error) {
    console.error(error);
  }
})();