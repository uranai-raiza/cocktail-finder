import { filterCocktails } from './filter.js';

const NEAR_MISS_LIMIT = 3;

function pairKey(ids) {
  return [...ids].sort().join('|');
}

function makeGenericCombo(liquorId, mixerId, ingredientsById) {
  const liquor = ingredientsById.get(liquorId);
  const mixer = ingredientsById.get(mixerId);
  return {
    id: `generic-${liquorId}-${mixerId}`,
    name: `${liquor.label}の${mixer.label}割り`,
    requiredIngredients: [liquorId, mixerId],
    ingredients: [
      { name: liquor.label, amount: 'お好みの量' },
      { name: mixer.label, amount: '適量' },
      { name: '氷', amount: '適量' },
    ],
    steps: [
      'グラスに氷を入れる',
      `${liquor.label}を注ぐ`,
      `${mixer.label}で好みの濃さに割って、軽く混ぜる`,
    ],
  };
}

export function buildSuggestions({ selectedIds, formalCocktails, casualCombos, ingredientsById }) {
  const checkedSet = new Set(selectedIds);
  const formal = filterCocktails(formalCocktails, checkedSet);
  const casualCurated = filterCocktails(casualCombos, checkedSet);

  const coveredPairs = new Set(
    [...formal, ...casualCurated]
      .filter((c) => c.requiredIngredients.length === 2)
      .map((c) => pairKey(c.requiredIngredients))
  );

  const selectedLiquors = [...new Set(selectedIds)].filter(
    (id) => ingredientsById.get(id)?.category === 'liquor'
  );
  const selectedMixers = [...new Set(selectedIds)].filter(
    (id) => ingredientsById.get(id)?.category === 'mixer'
  );

  const generic = [];
  for (const liquorId of selectedLiquors) {
    for (const mixerId of selectedMixers) {
      if (coveredPairs.has(pairKey([liquorId, mixerId]))) continue;
      generic.push(makeGenericCombo(liquorId, mixerId, ingredientsById));
    }
  }

  const matchedIds = new Set([...formal, ...casualCurated].map((c) => c.id));
  const nearMiss = [];
  for (const entry of [...casualCombos, ...formalCocktails]) {
    if (matchedIds.has(entry.id)) continue;
    const missing = entry.requiredIngredients.filter((id) => !checkedSet.has(id));
    const present = entry.requiredIngredients.filter((id) => checkedSet.has(id));
    if (missing.length === 1 && present.length >= 1) {
      nearMiss.push({ ...entry, missingIngredientId: missing[0] });
    }
  }

  return { casual: [...casualCurated, ...generic], nearMiss: nearMiss.slice(0, NEAR_MISS_LIMIT), formal };
}
