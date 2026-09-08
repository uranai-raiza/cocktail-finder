import test from 'node:test';
import assert from 'node:assert/strict';
import { renderIngredientOptions, renderRecipeCard, renderRecipeList } from '../render.js';

const liquors = [
  { id: 'gin', label: 'ジン', category: 'liquor' },
  { id: 'umeshu', label: '梅酒', category: 'liquor' },
];

const cocktail = {
  id: 'gin-tonic',
  name: 'ジントニック',
  requiredIngredients: ['gin', 'tonic'],
  ingredients: [
    { name: 'ジン', amount: '45ml' },
    { name: 'トニックウォーター', amount: '適量' },
  ],
  steps: ['グラスに氷を入れる', 'ジンを注ぐ'],
};

test('renderIngredientOptionsは先頭に空欄の選択肢を持つ', () => {
  const html = renderIngredientOptions(liquors);
  assert.match(html, /^\s*<option value="">/);
});

test('renderIngredientOptionsは各材料のoptionを含む', () => {
  const html = renderIngredientOptions(liquors);
  assert.match(html, /<option value="gin">ジン<\/option>/);
  assert.match(html, /<option value="umeshu">梅酒<\/option>/);
});

test('renderRecipeCardは名前・材料・手順を含む', () => {
  const html = renderRecipeCard(cocktail);
  assert.match(html, /ジントニック/);
  assert.match(html, /45ml/);
  assert.match(html, /グラスに氷を入れる/);
});

test('renderRecipeListは空配列で指定したメッセージを返す', () => {
  const html = renderRecipeList([], 'からっぽです');
  assert.match(html, /からっぽです/);
});

test('renderRecipeListは各カクテルのカードを連結する', () => {
  const html = renderRecipeList([cocktail, { ...cocktail, id: 'x', name: '別の飲み方' }], '空');
  assert.match(html, /ジントニック/);
  assert.match(html, /別の飲み方/);
});
