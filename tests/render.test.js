import test from 'node:test';
import assert from 'node:assert/strict';
import {
  renderIngredientOptions,
  renderCasualCard,
  renderNearMissCard,
  renderFormalCard,
  renderCasualSection,
  renderFormalSection,
} from '../render.js';

const liquors = [
  { id: 'gin', label: 'ジン', category: 'liquor' },
  { id: 'umeshu', label: '梅酒', category: 'liquor' },
];

const casualExact = {
  id: 'shochu-oolong',
  name: '焼酎のウーロン割り',
  requiredIngredients: ['shochu', 'oolongTea'],
  ingredients: [
    { name: '焼酎', amount: '60ml目安' },
    { name: '烏龍茶', amount: '適量' },
    { name: '氷', amount: '適量' },
  ],
  steps: ['グラスに氷を入れ、焼酎を注ぐ', '烏龍茶で好みの濃さに割って、軽く混ぜる'],
};

const nearMissItem = {
  id: 'umeshu-soda',
  name: '梅酒ソーダ割り',
  requiredIngredients: ['umeshu', 'soda'],
  missingIngredientId: 'soda',
  ingredients: [
    { name: '梅酒', amount: '45ml' },
    { name: '炭酸水', amount: '適量' },
    { name: '氷', amount: '適量' },
  ],
  steps: ['a', 'b'],
};

const formalItem = {
  id: 'screwdriver',
  name: 'スクリュードライバー',
  requiredIngredients: ['vodka', 'orangeJuice'],
  ingredients: [
    { name: 'ウォッカ', amount: '45ml' },
    { name: 'オレンジジュース', amount: '適量' },
    { name: '氷', amount: '適量' },
  ],
  steps: ['グラスに氷を入れ、ウォッカを注ぐ', 'オレンジジュースで満たし、軽くステアする'],
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

test('renderCasualCardは名前・材料タグ・番号付き手順を含む', () => {
  const html = renderCasualCard(casualExact);
  assert.match(html, /焼酎のウーロン割り/);
  assert.match(html, /焼酎 60ml目安/);
  assert.match(html, /烏龍茶 適量/);
  assert.match(html, />氷</); // neutral tag: name only, no amount
  assert.match(html, /グラスに氷を入れ、焼酎を注ぐ/);
});

test('renderNearMissCardは不足材料名を含むバッジと、有り/不足タグを持つ', () => {
  const html = renderNearMissCard(nearMissItem);
  assert.match(html, /梅酒ソーダ割り/);
  assert.match(html, /炭酸水があれば/);
  assert.match(html, /梅酒 45ml/);
  assert.match(html, /＋炭酸水/);
});

test('renderNearMissCardは手順を含まない', () => {
  const html = renderNearMissCard(nearMissItem);
  assert.doesNotMatch(html, /<ol/);
});

test('renderFormalCardは材料を1行で連結し、手順を段落でつなげる', () => {
  const html = renderFormalCard(formalItem);
  assert.match(html, /スクリュードライバー/);
  assert.match(html, /ウォッカ 45ml/);
  assert.match(html, /オレンジジュース 適量/);
  assert.match(html, /・ 氷<\/p>/); // neutral: name only, no amount
  assert.doesNotMatch(html, /<ol/);
  assert.doesNotMatch(html, /<li/);
});

test('renderCasualSectionは両方空ならメッセージを返す', () => {
  const html = renderCasualSection([], [], 'からっぽ');
  assert.match(html, /からっぽ/);
});

test('renderCasualSectionはcasualとnearMissの両方を連結する', () => {
  const html = renderCasualSection([casualExact], [nearMissItem], 'からっぽ');
  assert.match(html, /焼酎のウーロン割り/);
  assert.match(html, /梅酒ソーダ割り/);
});

test('renderFormalSectionは空ならメッセージを返す', () => {
  const html = renderFormalSection([], 'からっぽ');
  assert.match(html, /からっぽ/);
});

test('renderFormalSectionはカードを連結する', () => {
  const html = renderFormalSection([formalItem], 'からっぽ');
  assert.match(html, /スクリュードライバー/);
});
