import { INGREDIENTS } from './data/ingredients.js';
import { buildSuggestions } from './suggestions.js';
import { renderIngredientOptions, renderDatalistOptions, renderCasualSection, renderFormalSection } from './render.js';

const selectLiquor1 = document.getElementById('select-liquor-1');
const inputLiquor2 = document.getElementById('input-liquor-2');
const selectMixer1 = document.getElementById('select-mixer-1');
const inputMixer2 = document.getElementById('input-mixer-2');
const liquorDatalist = document.getElementById('liquor-datalist');
const mixerDatalist = document.getElementById('mixer-datalist');
const casualListEl = document.getElementById('casual-list');
const formalListEl = document.getElementById('formal-list');

const staticIngredientsById = new Map(INGREDIENTS.map((i) => [i.id, i]));
const liquorItems = INGREDIENTS.filter((i) => i.category === 'liquor');
const mixerItems = INGREDIENTS.filter((i) => i.category === 'mixer');
const liquorLabelToId = new Map(liquorItems.map((i) => [i.label, i.id]));
const mixerLabelToId = new Map(mixerItems.map((i) => [i.label, i.id]));

// Resolves a free-text input's value: matches an existing ingredient by
// label (behaves exactly like picking it from the dropdown) or, for any
// other non-empty text, treats the typed text itself as a new custom
// ingredient so it can still flow through the same matching/generation
// logic as a canonical one.
function resolveTextInput(inputEl, labelToId, category) {
  const raw = inputEl.value.trim();
  if (!raw) return null;
  const knownId = labelToId.get(raw);
  if (knownId) return { id: knownId, custom: null };
  return { id: raw, custom: { id: raw, label: raw, category } };
}

async function main() {
  selectLiquor1.innerHTML = renderIngredientOptions(liquorItems);
  selectMixer1.innerHTML = renderIngredientOptions(mixerItems);
  liquorDatalist.innerHTML = renderDatalistOptions(liquorItems);
  mixerDatalist.innerHTML = renderDatalistOptions(mixerItems);

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
    const resolvedLiquor2 = resolveTextInput(inputLiquor2, liquorLabelToId, 'liquor');
    const resolvedMixer2 = resolveTextInput(inputMixer2, mixerLabelToId, 'mixer');

    selectLiquor1.classList.toggle('has-value', selectLiquor1.value !== '');
    selectMixer1.classList.toggle('has-value', selectMixer1.value !== '');
    inputLiquor2.classList.toggle('has-value', resolvedLiquor2 !== null);
    inputMixer2.classList.toggle('has-value', resolvedMixer2 !== null);

    const selectedIds = [
      ...new Set(
        [selectLiquor1.value, resolvedLiquor2?.id, selectMixer1.value, resolvedMixer2?.id].filter(Boolean)
      ),
    ];

    const ingredientsById = new Map(staticIngredientsById);
    if (resolvedLiquor2?.custom) ingredientsById.set(resolvedLiquor2.custom.id, resolvedLiquor2.custom);
    if (resolvedMixer2?.custom) ingredientsById.set(resolvedMixer2.custom.id, resolvedMixer2.custom);

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

  [selectLiquor1, selectMixer1].forEach((el) => el.addEventListener('change', render));
  [inputLiquor2, inputMixer2].forEach((el) => el.addEventListener('input', render));
  render();
}

main();
