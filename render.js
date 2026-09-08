const CATEGORY_LABELS = { liquor: 'お酒', mixer: '割り材' };

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderIngredientChecklist(ingredients) {
  const categories = ['liquor', 'mixer'];
  return categories
    .map((category) => {
      const items = ingredients.filter((i) => i.category === category);
      const options = items
        .map(
          (i) => `
        <label class="ingredient-option">
          <input type="checkbox" id="ing-${i.id}" value="${i.id}">
          ${escapeHtml(i.label)}
        </label>`
        )
        .join('');
      return `
      <fieldset class="ingredient-group">
        <legend>${CATEGORY_LABELS[category]}</legend>
        ${options}
      </fieldset>`;
    })
    .join('');
}

export function renderRecipeCard(cocktail) {
  const ingredientItems = cocktail.ingredients
    .map((i) => `<li>${escapeHtml(i.name)} ${escapeHtml(i.amount)}</li>`)
    .join('');
  const stepItems = cocktail.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  return `
    <article class="recipe-card">
      <h3><span class="recipe-card-icon" aria-hidden="true">🍸</span>${escapeHtml(cocktail.name)}</h3>
      <ul class="recipe-ingredients">${ingredientItems}</ul>
      <ol class="recipe-steps">${stepItems}</ol>
    </article>`;
}

export function renderRecipeList(cocktails) {
  if (cocktails.length === 0) {
    return '<p class="empty-state">🍋✨ 作れるカクテルがありません。材料を追加してみてください</p>';
  }
  return cocktails.map(renderRecipeCard).join('');
}
