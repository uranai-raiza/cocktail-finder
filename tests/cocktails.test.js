import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INGREDIENTS } from '../data/ingredients.js';

const cocktails = JSON.parse(
  readFileSync(new URL('../data/cocktails.json', import.meta.url), 'utf8')
);
const validIds = new Set(INGREDIENTS.map((i) => i.id));

test('27種類のカクテルが定義されている', () => {
  assert.equal(cocktails.length, 27);
});

test('ウォッカコーラ(vodka+cola)が定義されている', () => {
  const vodkaCoke = cocktails.find((c) => c.id === 'vodka-coke');
  assert.ok(vodkaCoke, 'id: vodka-coke が見つからない');
  assert.equal(vodkaCoke.name, 'ウォッカコーラ');
  assert.deepEqual(vodkaCoke.requiredIngredients, ['vodka', 'cola']);
});

test('各カクテルは必須フィールドを持つ', () => {
  for (const c of cocktails) {
    assert.equal(typeof c.id, 'string');
    assert.equal(typeof c.name, 'string');
    assert.equal(typeof c.base, 'string');
    assert.ok(Array.isArray(c.requiredIngredients) && c.requiredIngredients.length >= 1);
    assert.ok(Array.isArray(c.ingredients) && c.ingredients.length >= 1);
    assert.ok(Array.isArray(c.steps) && c.steps.length >= 1);
  }
});

test('requiredIngredientsは材料マスタに存在するidのみ', () => {
  for (const c of cocktails) {
    for (const id of c.requiredIngredients) {
      assert.ok(validIds.has(id), `${c.name} の requiredIngredients に未知のid: ${id}`);
    }
  }
});

test('idはすべて一意', () => {
  const ids = cocktails.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});
