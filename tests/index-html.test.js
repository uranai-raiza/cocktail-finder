import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('1つ目のお酒・割り材はプルダウンのまま', () => {
  assert.match(html, /<select[^>]*id="select-liquor-1"/);
  assert.match(html, /<select[^>]*id="select-mixer-1"/);
});

test('2つ目のお酒・割り材は自由入力(datalist付きtext input)に変わっている', () => {
  assert.doesNotMatch(html, /<select[^>]*id="select-liquor-2"/);
  assert.doesNotMatch(html, /<select[^>]*id="select-mixer-2"/);
  assert.match(html, /<input type="text" id="input-liquor-2" list="liquor-datalist"/);
  assert.match(html, /<input type="text" id="input-mixer-2" list="mixer-datalist"/);
  assert.match(html, /<datalist id="liquor-datalist">/);
  assert.match(html, /<datalist id="mixer-datalist">/);
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
