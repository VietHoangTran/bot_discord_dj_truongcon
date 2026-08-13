---
name: testing
description: Quy trình thêm và chạy test cho bot bằng Node built-in test runner (node --test). Dùng khi thêm logic thuần cần kiểm tra hoặc viết test mới.
---

# Testing

Quy trình thêm test cho bot. Dùng **Node built-in test runner** (`node --test`, Node 22+) — không cần thêm dependency.

## Chạy test

```bash
npm test   # = node --test
```

## Cấu trúc

- Thư mục `test/` chứa các file test (`*.test.js`).
- Test các **hàm thuần** dễ kiểm tra — không test trực tiếp Discord API/voice (cần mock phức tạp).

## Các hàm thuần nên test

Hiện tại logic thuần nằm trong `src/index.js` (chưa tách module). Khi thêm test, nên **tách logic thuần ra module riêng** (vd: `src/utils.js`) để test được. Ví dụ:

- **Làm sạch link YouTube** (bỏ tham số rác, giữ playlist thật) — logic trong `interactionCreate` case `play`.
- **Whitelist check** (`isGuildAllowed`).
- **Parse `ALLOWED_GUILD_IDS`** từ chuỗi.

## Ví dụ test

```js
// test/utils.test.js
const { test } = require('node:test');
const assert = require('node:assert');

test('làm sạch link YouTube bỏ tham số rác', () => {
  assert.equal(cleanYouTubeLink('https://youtu.be/abc123?si=x&t=5'), 'https://www.youtube.com/watch?v=abc123');
});
```

## Lưu ý

- Khi thêm logic thuần mới → viết test kèm theo.
- Chạy `npm test` trước khi commit để đảm bảo không phá vỡ gì.
- Không test các hàm phụ thuộc Discord client/voice (cần mock) — tập trung vào logic thuần.
