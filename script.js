import { INGREDIENTS } from './data/ingredients.js';
import { filterCocktails } from './filter.js';
import { renderIngredientChecklist, renderRecipeList } from './render.js';

const ingredientListEl = document.getElementById('ingredient-list');
const recipeListEl = document.getElementById('recipe-list');

function getCheckedIds() {
  const checked = ingredientListEl.querySelectorAll('input[type="checkbox"]:checked');
  return new Set(Array.from(checked).map((el) => el.value));
}

async function main() {
  ingredientListEl.innerHTML = renderIngredientChecklist(INGREDIENTS);

  let cocktails;
  try {
    const res = await fetch('./data/cocktails.json');
    cocktails = await res.json();
  } catch {
    recipeListEl.innerHTML = '<p class="empty-state">データを読み込めませんでした</p>';
    return;
  }

  function render() {
    const checkedIds = getCheckedIds();
    recipeListEl.innerHTML = renderRecipeList(filterCocktails(cocktails, checkedIds));
  }

  ingredientListEl.addEventListener('change', render);
  render();
}

main();
