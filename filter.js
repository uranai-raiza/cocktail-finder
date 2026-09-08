export function filterCocktails(cocktails, checkedIds) {
  return cocktails.filter((cocktail) =>
    cocktail.requiredIngredients.every((id) => checkedIds.has(id))
  );
}
