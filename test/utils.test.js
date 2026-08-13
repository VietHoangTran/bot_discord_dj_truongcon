// Test cho src/utils.js — Node built-in test runner (node --test).
const { test } = require('node:test');
const assert = require('node:assert');
const { isPlaylistLink, cleanYouTubeLink, parseGuildIds, isGuildAllowed } = require('../src/utils');

test('isPlaylistLink: nhận link playlist thật', () => {
  assert.equal(isPlaylistLink('https://www.youtube.com/playlist?list=PLabc123def45'), true);
  assert.equal(isPlaylistLink('https://www.youtube.com/watch?v=abc123def45&list=PLabc123def45'), true);
  assert.equal(isPlaylistLink('https://www.youtube.com/watch?v=abc123def45&list=UUabc123def45'), true);
});

test('isPlaylistLink: không nhận autoplay radio (RD) hoặc video thường', () => {
  assert.equal(isPlaylistLink('https://www.youtube.com/watch?v=abc123def45&list=RDabc123def45'), false);
  assert.equal(isPlaylistLink('https://www.youtube.com/watch?v=abc123def45'), false);
  assert.equal(isPlaylistLink('https://youtu.be/abc123def45'), false);
});

test('cleanYouTubeLink: bỏ tham số rác khỏi link video', () => {
  assert.equal(
    cleanYouTubeLink('https://youtu.be/abc123def45?si=xyz&t=5'),
    'https://www.youtube.com/watch?v=abc123def45',
  );
  assert.equal(
    cleanYouTubeLink('https://www.youtube.com/watch?v=abc123def45&list=RDxyz'),
    'https://www.youtube.com/watch?v=abc123def45',
  );
  assert.equal(
    cleanYouTubeLink('https://www.youtube.com/shorts/abc123def45?si=xyz'),
    'https://www.youtube.com/watch?v=abc123def45',
  );
});

test('cleanYouTubeLink: giữ nguyên playlist thật', () => {
  const playlist = 'https://www.youtube.com/playlist?list=PLabc123def45';
  assert.equal(cleanYouTubeLink(playlist), playlist);
});

test('cleanYouTubeLink: trả về query gốc nếu không phải link YouTube', () => {
  assert.equal(cleanYouTubeLink('tên bài hát'), 'tên bài hát');
  assert.equal(cleanYouTubeLink('https://soundcloud.com/abc'), 'https://soundcloud.com/abc');
});

test('parseGuildIds: parse chuỗi dấu phẩy, trim, bỏ rỗng', () => {
  assert.deepEqual(parseGuildIds('id1, id2 ,,id3'), ['id1', 'id2', 'id3']);
  assert.deepEqual(parseGuildIds(''), []);
  assert.deepEqual(parseGuildIds(undefined), []);
});

test('isGuildAllowed: whitelist bật/tắt', () => {
  assert.equal(isGuildAllowed('g1', ['g1', 'g2']), true);
  assert.equal(isGuildAllowed('g3', ['g1', 'g2']), false);
  // allowedIds rỗng = cho phép mọi server.
  assert.equal(isGuildAllowed('anything', []), true);
});
