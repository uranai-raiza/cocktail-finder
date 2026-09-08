import { INGREDIENTS } from './data/ingredients.js';
import { buildSuggestions } from './suggestions.js';
import { renderIngredientOptions, renderCasualSection, renderFormalSection } from './render.js';

const liquorSelects = [
  document.getElementById('select-liquor-1'),
  document.getElementById('select-liquor-2'),
];
const mixerSelects = [
  document.getElementById('select-mixer-1'),
  document.getElementById('select-mixer-2'),
];
const casualListEl = document.getElementById('casual-list');
const formalListEl = document.getElementById('formal-list');

const ingredientsById = new Map(INGREDIENTS.map((i) => [i.id, i]));

function getSelectedIds() {
  const values = [...liquorSelects, ...mixerSelects].map((el) => el.value).filter(Boolean);
  return [...new Set(values)];
}

async function main() {
  const liquorOptions = renderIngredientOptions(INGREDIENTS.filter((i) => i.category === 'liquor'));
  const mixerOptions = renderIngredientOptions(INGREDIENTS.filter((i) => i.category === 'mixer'));
  liquorSelects.forEach((el) => { el.innerHTML = liquorOptions; });
  mixerSelects.forEach((el) => { el.innerHTML = mixerOptions; });

  let formalCocktails;
  let casualCombos;
  try {
    const [formalRes, casualRes] = await Promise.all([
      fetch('./data/cocktails.json'),
      fetch('./data/casualCombos.json'),
    ]);
    formalCocktails = await formalRes.json();
    casualCombos = await casualRes.json();
  } catch {
    casualListEl.innerHTML = '<p class="empty-state">データを読み込めませんでした</p>';
    formalListEl.innerHTML = '';
    return;
  }

  function render() {
    [...liquorSelects, ...mixerSelects].forEach((el) => {
      el.classList.toggle('has-value', el.value !== '');
    });
    const selectedIds = getSelectedIds();
    const { casual, nearMiss, formal } = buildSuggestions({
      selectedIds,
      formalCocktails,
      casualCombos,
      ingredientsById,
    });
    casualListEl.innerHTML = renderCasualSection(
      casual,
      nearMiss,
      'お酒・割り材を選ぶと、飲み方の提案がここに出てきます'
    );
    formalListEl.innerHTML = renderFormalSection(
      formal,
      '材料をもっと選ぶと、作れる本格派カクテルが出てきます'
    );
  }

  [...liquorSelects, ...mixerSelects].forEach((el) => el.addEventListener('change', render));
  render();
}

main();
