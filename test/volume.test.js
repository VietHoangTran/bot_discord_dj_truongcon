// Test cho src/volume.js — Node built-in test runner (node --test).
const { test } = require('node:test');
const assert = require('node:assert');
const { DEFAULT_VOLUME, getVolume, setVolume } = require('../src/volume');

test('DEFAULT_VOLUME là 100', () => {
  assert.equal(DEFAULT_VOLUME, 100);
});

test('getVolume trả về mặc định 100 khi chưa set', () => {
  assert.equal(getVolume('guild-chua-set'), 100);
});

test('setVolume rồi getVolume trả về giá trị đã lưu theo guild', () => {
  setVolume('guild-a', 80);
  setVolume('guild-b', 120);
  assert.equal(getVolume('guild-a'), 80);
  assert.equal(getVolume('guild-b'), 120);
  // Guild khác không bị ảnh hưởng.
  assert.equal(getVolume('guild-c'), 100);
});
