import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('お酒2つ・割り材2つのプルダウンを持つ', () => {
  assert.match(html, /<select[^>]*id="select-liquor-1"/);
  assert.match(html, /<select[^>]*id="select-liquor-2"/);
  assert.match(html, /<select[^>]*id="select-mixer-1"/);
  assert.match(html, /<select[^>]*id="select-mixer-2"/);
});

test('気軽な提案と本格派カクテルの入れ物を持つ', () => {
  assert.match(html, /id="casual-list"/);
  assert.match(html, /id="formal-list"/);
});

test('アプリ名は宅飲みミックス', () => {
  assert.match(html, /<title>宅飲みミックス<\/title>/);
  assert.match(html, /<h1>宅飲みミックス<\/h1>/);
});

test('script.jsをモジュールとして読み込む', () => {
  assert.match(html, /<script[^>]*type="module"[^>]*src="script\.js"/);
});

test('style.cssを読み込む', () => {
  assert.match(html, /<link[^>]*href="style\.css"/);
});

test('viewportメタタグを持つ(レスポンシブ対応)', () => {
  assert.match(html, /name="viewport"/);
});
