import test from 'node:test';
import assert from 'node:assert/strict';
import { INGREDIENTS } from '../data/ingredients.js';

test('26種類の材料が定義されている', () => {
  assert.equal(INGREDIENTS.length, 26);
});

test('お酒が12種類、割り材が14種類', () => {
  const liquors = INGREDIENTS.filter((i) => i.category === 'liquor');
  const mixers = INGREDIENTS.filter((i) => i.category === 'mixer');
  assert.equal(liquors.length, 12);
  assert.equal(mixers.length, 14);
});

test('idはすべて一意', () => {
  const ids = INGREDIENTS.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('各材料はid・label・categoryを持つ', () => {
  for (const ing of INGREDIENTS) {
    assert.equal(typeof ing.id, 'string');
    assert.equal(typeof ing.label, 'string');
    assert.ok(ing.category === 'liquor' || ing.category === 'mixer');
  }
});
