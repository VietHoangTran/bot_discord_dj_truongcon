// Entry point: khởi tạo client + distube, đăng ký handlers/events, login.
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { commandsJSON } = require('./commands');
const { loadCookies, whitelistEnabled, ALLOWED_GUILD_IDS, isGuildAllowed } = require('./config');
const { createDisTube } = require('./distube');
const { registerDisTubeEvents } = require('./events');
const { createInteractionHandler } = require('./handlers');

// Nạp cookies YouTube (nếu có) để né bot detection trên IP datacenter.
loadCookies();

// Khởi tạo libsodium cho mã hóa voice (tránh timeout 30s do thiếu encryptor).
require('libsodium-wrappers');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

const distube = createDisTube(client);
registerDisTubeEvents(distube);

// Đăng ký slash commands khi bot sẵn sàng:
// - Có whitelist: guild command vào từng guild được phép (hiện ngay <1s, guild luôn cache).
// - Không whitelist: global command (mọi server, có thể mất 1h propagate).
client.once('clientReady', async () => {
  console.log(`Bot đã online: ${client.user.tag}`);
  try {
    if (whitelistEnabled) {
      console.log(`Whitelist ${ALLOWED_GUILD_IDS.length} guild(s): ${ALLOWED_GUILD_IDS.join(', ')}`);
      const guilds = client.guilds.cache.filter((g) => isGuildAllowed(g.id));
      for (const [id, g] of guilds) {
        try {
          await client.application.commands.set(commandsJSON, id);
          console.log(`✅ Đăng ký commands vào guild: ${g.name} (${id})`);
        } catch (e) {
          console.error(`❌ Lỗi đăng ký commands vào ${id}:`, e.message);
        }
      }
    } else {
      await client.application.commands.set(commandsJSON);
      console.log('✅ Đã đăng ký global commands (mọi server)');
    }
  } catch (err) {
    console.error('❌ Lỗi đăng ký slash commands:', err);
  }
  console.log(
    `Guilds trong cache (${client.guilds.cache.size}):`,
    client.guilds.cache.map((g) => g.name).join(', ') || '(trống)',
  );
});

// Khi bot được thêm vào guild mới: nếu guild trong whitelist -> đăng ký commands ngay.
client.on('guildCreate', async (guild) => {
  console.log(`[GUILD JOIN] Bot được thêm vào: ${guild.name} (id=${guild.id})`);
  if (whitelistEnabled && isGuildAllowed(guild.id)) {
    try {
      await client.application.commands.set(commandsJSON, guild.id);
      console.log(`✅ Đăng ký commands vào guild mới (whitelist): ${guild.name} (${guild.id})`);
    } catch (e) {
      console.error(`❌ Lỗi đăng ký commands vào guild mới ${guild.id}:`, e.message);
    }
  } else if (whitelistEnabled) {
    console.log(`⏭️ Guild ${guild.name} (${guild.id}) không trong whitelist -> bot không hoạt động ở đây.`);
  }
});

client.on('guildDelete', (guild) => {
  console.log(`[GUILD LEAVE] Bot bị xóa khỏi: ${guild?.name ?? '?'} (id=${guild?.id})`);
});

// Xử lý slash commands (logic trong handlers.js).
client.on('interactionCreate', createInteractionHandler({ distube, isGuildAllowed }));

// Bắt lỗi để bot không crash: log thay vì để process thoát.
client.on('error', (err) => console.error('[client error]', err));
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));

client.login(process.env.DISCORD_TOKEN);
