import { INGREDIENTS } from './data/ingredients.js';

const ID_TO_INGREDIENT = new Map(INGREDIENTS.map((i) => [i.id, i]));
const LABEL_TO_CATEGORY = new Map(INGREDIENTS.map((i) => [i.label, i.category]));

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

function ingredientDisplay(item) {
  const category = LABEL_TO_CATEGORY.get(item.name);
  return category ? `${item.name} ${item.amount}` : item.name;
}

function renderTag(text, variant) {
  return `<span class="tag tag-${variant}">${escapeHtml(text)}</span>`;
}

export function renderCasualCard(cocktail) {
  const tags = cocktail.ingredients
    .map((i) => {
      const category = LABEL_TO_CATEGORY.get(i.name);
      const variant = category === 'liquor' ? 'liquor' : category === 'mixer' ? 'mixer' : 'neutral';
      return renderTag(ingredientDisplay(i), variant);
    })
    .join('');
  const steps = cocktail.steps
    .map(
      (s, i) => `
      <div class="step-row">
        <span class="step-number">${i + 1}</span>
        <span class="step-text">${escapeHtml(s)}</span>
      </div>`
    )
    .join('');
  return `
    <article class="casual-card">
      <div class="casual-badge"><span>今すぐ</span><span>作れる</span></div>
      <h3 class="casual-card-title">${escapeHtml(cocktail.name)}</h3>
      <div class="tag-row">${tags}</div>
      <div class="step-list">${steps}</div>
    </article>`;
}

export function renderNearMissCard(cocktail) {
  const missing = ID_TO_INGREDIENT.get(cocktail.missingIngredientId);
  const presentIds = cocktail.requiredIngredients.filter((id) => id !== cocktail.missingIngredientId);
  const haveTags = presentIds
    .map((id) => {
      const ingredient = ID_TO_INGREDIENT.get(id);
      const match = cocktail.ingredients.find((i) => i.name === ingredient.label);
      const text = match ? `${match.name} ${match.amount}` : ingredient.label;
      return `<span class="tag tag-have">${escapeHtml(text)}</span>`;
    })
    .join('');
  const missingTag = `<span class="tag tag-missing">＋${escapeHtml(missing.label)}</span>`;
  return `
    <article class="nearmiss-card">
      <div class="nearmiss-badge">${escapeHtml(missing.label)}があれば◎</div>
      <h3 class="nearmiss-card-title">${escapeHtml(cocktail.name)}</h3>
      <div class="tag-row">${haveTags}${missingTag}</div>
    </article>`;
}

export function renderFormalCard(cocktail) {
  const ingredientLine = cocktail.ingredients.map(ingredientDisplay).map(escapeHtml).join(' ・ ');
  const stepsText = escapeHtml(cocktail.steps.join('。')) + '。';
  return `
    <article class="formal-card">
      <div class="formal-badge">🍸</div>
      <h3 class="formal-card-title">${escapeHtml(cocktail.name)}</h3>
      <p class="formal-ingredients">${ingredientLine}</p>
      <p class="formal-steps">${stepsText}</p>
    </article>`;
}

function renderEmptyState(message) {
  return `<p class="empty-state">${escapeHtml(message)}</p>`;
}

export function renderCasualSection(casual, nearMiss, emptyMessage) {
  if (casual.length === 0 && nearMiss.length === 0) {
    return renderEmptyState(emptyMessage);
  }
  return casual.map(renderCasualCard).join('') + nearMiss.map(renderNearMissCard).join('');
}

export function renderFormalSection(formal, emptyMessage) {
  if (formal.length === 0) {
    return renderEmptyState(emptyMessage);
  }
  return formal.map(renderFormalCard).join('');
}
