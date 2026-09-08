import test from 'node:test';
import assert from 'node:assert/strict';
import { renderIngredientChecklist, renderRecipeCard, renderRecipeList } from '../render.js';

const ingredients = [
  { id: 'gin', label: 'ジン', category: 'liquor' },
  { id: 'tonic', label: 'トニックウォーター', category: 'mixer' },
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

test('renderIngredientChecklistは各材料のチェックボックスを含む', () => {
  const html = renderIngredientChecklist(ingredients);
  assert.match(html, /id="ing-gin"/);
  assert.match(html, /id="ing-tonic"/);
  assert.match(html, /ジン/);
  assert.match(html, /トニックウォーター/);
});

test('renderIngredientChecklistはカテゴリ見出しを含む', () => {
  const html = renderIngredientChecklist(ingredients);
  assert.match(html, /お酒/);
  assert.match(html, /割り材/);
});

test('renderRecipeCardは名前・材料・手順を含む', () => {
  const html = renderRecipeCard(cocktail);
  assert.match(html, /ジントニック/);
  assert.match(html, /45ml/);
  assert.match(html, /グラスに氷を入れる/);
});

test('renderRecipeListは空配列でempty-stateを返す', () => {
  const html = renderRecipeList([]);
  assert.match(html, /作れるカクテルがありません/);
});

test('renderRecipeListは各カクテルのカードを連結する', () => {
  const html = renderRecipeList([cocktail, { ...cocktail, id: 'x', name: '別のカクテル' }]);
  assert.match(html, /ジントニック/);
  assert.match(html, /別のカクテル/);
});
