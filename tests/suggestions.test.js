import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSuggestions } from '../suggestions.js';

const ingredientsById = new Map([
  ['gin', { id: 'gin', label: 'ジン', category: 'liquor' }],
  ['umeshu', { id: 'umeshu', label: '梅酒', category: 'liquor' }],
  ['tonic', { id: 'tonic', label: 'トニックウォーター', category: 'mixer' }],
  ['soda', { id: 'soda', label: '炭酸水', category: 'mixer' }],
  ['mugicha', { id: 'mugicha', label: '麦茶', category: 'mixer' }],
]);

const formalCocktails = [
  { id: 'gin-tonic', name: 'ジントニック', requiredIngredients: ['gin', 'tonic'], ingredients: [], steps: ['a'] },
];

const casualCombos = [
  { id: 'umeshu-soda', name: '梅酒ソーダ割り', requiredIngredients: ['umeshu', 'soda'], ingredients: [], steps: ['a'] },
];

test('選択が空なら何も提案されない', () => {
  const result = buildSuggestions({ selectedIds: [], formalCocktails, casualCombos, ingredientsById });
  assert.deepEqual(result.formal, []);
  assert.deepEqual(result.casual, []);
});

test('formalに一致するものはformalへ入る', () => {
  const result = buildSuggestions({
    selectedIds: ['gin', 'tonic'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  assert.deepEqual(result.formal.map((c) => c.id), ['gin-tonic']);
});

test('casualに一致するものはcasualへ入る', () => {
  const result = buildSuggestions({
    selectedIds: ['umeshu', 'soda'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  assert.deepEqual(result.casual.map((c) => c.id), ['umeshu-soda']);
});

test('formal/casualどちらにも無い組み合わせは自動生成される', () => {
  const result = buildSuggestions({
    selectedIds: ['gin', 'mugicha'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  assert.equal(result.casual.length, 1);
  assert.equal(result.casual[0].name, 'ジンの麦茶割り');
  assert.deepEqual(result.casual[0].requiredIngredients, ['gin', 'mugicha']);
});

test('formalで既にカバーされているペアは自動生成しない(ジン+トニックの重複防止)', () => {
  const result = buildSuggestions({
    selectedIds: ['gin', 'tonic'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  assert.equal(result.casual.length, 0);
});

test('casualで既にカバーされているペアは自動生成しない(梅酒+ソーダの重複防止)', () => {
  const result = buildSuggestions({
    selectedIds: ['umeshu', 'soda'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  assert.equal(result.casual.length, 1);
  assert.equal(result.casual[0].id, 'umeshu-soda');
});

test('お酒だけ・割り材だけの選択では自動生成は発生しない', () => {
  const result = buildSuggestions({
    selectedIds: ['gin'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  assert.deepEqual(result.casual, []);
  assert.deepEqual(result.formal, []);
});

test('複数選択時は全ての酒×割り材の組み合わせぶん生成される', () => {
  const result = buildSuggestions({
    selectedIds: ['gin', 'umeshu', 'mugicha'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  const names = result.casual.map((c) => c.name).sort();
  assert.deepEqual(names, ['ジンの麦茶割り', '梅酒の麦茶割り']);
});
