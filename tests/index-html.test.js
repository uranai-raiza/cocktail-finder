import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('材料チェックリストとレシピ一覧の入れ物を持つ', () => {
  assert.match(html, /id="ingredient-list"/);
  assert.match(html, /id="recipe-list"/);
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
