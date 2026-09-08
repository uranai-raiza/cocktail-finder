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

test('自動生成された組み合わせの材料にはcategoryが付く(表示のタグ色分け用)', () => {
  const result = buildSuggestions({
    selectedIds: ['gin', 'mugicha'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  const [combo] = result.casual;
  const liquorItem = combo.ingredients.find((i) => i.name === 'ジン');
  const mixerItem = combo.ingredients.find((i) => i.name === '麦茶');
  assert.equal(liquorItem.category, 'liquor');
  assert.equal(mixerItem.category, 'mixer');
});

test('ingredientsByIdに無い自由入力idでも自動生成が動く(カスタム材料対応)', () => {
  const customIngredientsById = new Map([
    ...ingredientsById,
    ['自家製シロップ', { id: '自家製シロップ', label: '自家製シロップ', category: 'mixer' }],
  ]);
  const result = buildSuggestions({
    selectedIds: ['gin', '自家製シロップ'],
    formalCocktails,
    casualCombos,
    ingredientsById: customIngredientsById,
  });
  assert.equal(result.casual.length, 1);
  assert.equal(result.casual[0].name, 'ジンの自家製シロップ割り');
  const mixerItem = result.casual[0].ingredients.find((i) => i.name === '自家製シロップ');
  assert.equal(mixerItem.category, 'mixer');
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

test('1つだけ材料が足りない組み合わせはnearMissに入り、不足材料idを持つ', () => {
  const result = buildSuggestions({
    selectedIds: ['umeshu'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  assert.equal(result.nearMiss.length, 1);
  assert.equal(result.nearMiss[0].id, 'umeshu-soda');
  assert.equal(result.nearMiss[0].missingIngredientId, 'soda');
});

test('formal側もnearMiss対象になる', () => {
  const result = buildSuggestions({
    selectedIds: ['gin'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  assert.equal(result.nearMiss.length, 1);
  assert.equal(result.nearMiss[0].id, 'gin-tonic');
  assert.equal(result.nearMiss[0].missingIngredientId, 'tonic');
});

test('何も選択していなければnearMissは発生しない', () => {
  const result = buildSuggestions({ selectedIds: [], formalCocktails, casualCombos, ingredientsById });
  assert.deepEqual(result.nearMiss, []);
});

test('既に完全一致しているものはnearMissに重複して入らない', () => {
  const result = buildSuggestions({
    selectedIds: ['umeshu', 'soda'],
    formalCocktails,
    casualCombos,
    ingredientsById,
  });
  assert.deepEqual(result.nearMiss, []);
});

test('nearMissは最大3件までに絞られる', () => {
  const manyMixerCombos = [
    { id: 'a-soda', name: 'Aソーダ割り', requiredIngredients: ['a', 'soda'], ingredients: [], steps: ['x'] },
    { id: 'b-soda', name: 'Bソーダ割り', requiredIngredients: ['b', 'soda'], ingredients: [], steps: ['x'] },
    { id: 'c-soda', name: 'Cソーダ割り', requiredIngredients: ['c', 'soda'], ingredients: [], steps: ['x'] },
    { id: 'd-soda', name: 'Dソーダ割り', requiredIngredients: ['d', 'soda'], ingredients: [], steps: ['x'] },
    { id: 'e-soda', name: 'Eソーダ割り', requiredIngredients: ['e', 'soda'], ingredients: [], steps: ['x'] },
  ];
  const result = buildSuggestions({
    selectedIds: ['soda'],
    formalCocktails: [],
    casualCombos: manyMixerCombos,
    ingredientsById,
  });
  assert.equal(result.nearMiss.length, 3);
});

test('2つ以上材料が足りない組み合わせはnearMissに入らない', () => {
  const paloma = {
    id: 'paloma',
    name: 'パロマ',
    requiredIngredients: ['tequila', 'grapefruitJuice', 'soda', 'lemonLime'],
    ingredients: [],
    steps: ['a'],
  };
  const result = buildSuggestions({
    selectedIds: ['tequila'],
    formalCocktails: [...formalCocktails, paloma],
    casualCombos,
    ingredientsById,
  });
  assert.ok(!result.nearMiss.some((c) => c.id === 'paloma'));
});
