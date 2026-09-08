import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCocktails } from '../filter.js';

const sample = [
  { id: 'a', requiredIngredients: ['gin', 'tonic'] },
  { id: 'b', requiredIngredients: ['vodka', 'orangeJuice'] },
  { id: 'c', requiredIngredients: ['gin'] },
];

test('チェックが空なら何も一致しない', () => {
  const result = filterCocktails(sample, new Set());
  assert.deepEqual(result.map((c) => c.id), []);
});

test('必要材料の一部しか無ければ除外される', () => {
  const result = filterCocktails(sample, new Set(['gin']));
  assert.deepEqual(result.map((c) => c.id), ['c']);
});

test('必要材料がすべて揃っていれば含まれる', () => {
  const result = filterCocktails(sample, new Set(['gin', 'tonic']));
  assert.deepEqual(result.map((c) => c.id), ['a', 'c']);
});

test('必要以上の材料を持っていても含まれる', () => {
  const result = filterCocktails(sample, new Set(['gin', 'tonic', 'vodka', 'orangeJuice', 'rum']));
  assert.deepEqual(result.map((c) => c.id), ['a', 'b', 'c']);
});

test('元の配列順を保って返す', () => {
  const result = filterCocktails(sample, new Set(['gin', 'tonic', 'vodka', 'orangeJuice']));
  assert.deepEqual(result.map((c) => c.id), ['a', 'b', 'c']);
});
