import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INGREDIENTS } from '../data/ingredients.js';

const combos = JSON.parse(
  readFileSync(new URL('../data/casualCombos.json', import.meta.url), 'utf8')
);
const validIds = new Set(INGREDIENTS.map((i) => i.id));

test('14種類の気軽な組み合わせが定義されている', () => {
  assert.equal(combos.length, 14);
});

test('各組み合わせは必須フィールドを持つ', () => {
  for (const c of combos) {
    assert.equal(typeof c.id, 'string');
    assert.equal(typeof c.name, 'string');
    assert.ok(Array.isArray(c.requiredIngredients) && c.requiredIngredients.length >= 1);
    assert.ok(Array.isArray(c.ingredients) && c.ingredients.length >= 1);
    assert.ok(Array.isArray(c.steps) && c.steps.length >= 1);
  }
});

test('requiredIngredientsは材料マスタに存在するidのみ', () => {
  for (const c of combos) {
    for (const id of c.requiredIngredients) {
      assert.ok(validIds.has(id), `${c.name} の requiredIngredients に未知のid: ${id}`);
    }
  }
});

test('idはすべて一意', () => {
  const ids = combos.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});
