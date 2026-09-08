function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderIngredientOptions(items) {
  const options = items
    .map((i) => `<option value="${i.id}">${escapeHtml(i.label)}</option>`)
    .join('');
  return `<option value="">選択なし</option>${options}`;
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

export function renderRecipeList(cocktails, emptyMessage) {
  if (cocktails.length === 0) {
    return `<p class="empty-state">${escapeHtml(emptyMessage)}</p>`;
  }
  return cocktails.map(renderRecipeCard).join('');
}
