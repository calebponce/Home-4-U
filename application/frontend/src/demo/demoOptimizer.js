export const DEMO_PLAN_ITEMS = [
  {
    key: 'seating',
    label: 'Main seating anchor',
    category: 'Furniture',
    roomZone: 'Conversation area',
    allocation: 728,
    products: [
      { key: 'seating-fit', name: 'Nordic oak-frame sofa', retailer: 'IKEA', cost: 786.24, match: 'Best Fit', quality: 1 },
      { key: 'seating-value', name: 'Linen apartment sofa', retailer: 'Wayfair', cost: 626.08, match: 'Best Value', quality: 0.82 },
      { key: 'seating-alt', name: 'Textured modular loveseat', retailer: 'Target', cost: 706.16, match: 'Alternate', quality: 0.68 },
    ],
  },
  {
    key: 'lighting',
    label: 'Layered lighting',
    category: 'Lighting',
    roomZone: 'Ambient corners',
    allocation: 468,
    products: [
      { key: 'lighting-fit', name: 'Paper-shade floor lamp', retailer: 'IKEA', cost: 505.44, match: 'Best Fit', quality: 1 },
      { key: 'lighting-value', name: 'Soft-glow tripod lamp', retailer: 'Target', cost: 402.48, match: 'Best Value', quality: 0.82 },
      { key: 'lighting-alt', name: 'Dimmable linen lamp', retailer: 'Amazon', cost: 453.96, match: 'Alternate', quality: 0.68 },
    ],
  },
  {
    key: 'texture',
    label: 'Texture layer',
    category: 'Textiles',
    roomZone: 'Floor plane',
    allocation: 572,
    products: [
      { key: 'texture-fit', name: 'Handwoven wool area rug', retailer: 'Wayfair', cost: 617.76, match: 'Best Fit', quality: 1 },
      { key: 'texture-value', name: 'Neutral loop-pile rug', retailer: 'Target', cost: 491.92, match: 'Best Value', quality: 0.82 },
      { key: 'texture-alt', name: 'Flatwoven natural rug', retailer: 'IKEA', cost: 554.84, match: 'Alternate', quality: 0.68 },
    ],
  },
  {
    key: 'accents',
    label: 'Accent finish',
    category: 'Decor',
    roomZone: 'Shelves and tables',
    allocation: 312,
    products: [
      { key: 'accents-fit', name: 'Ceramic and linen accent set', retailer: 'Target', cost: 336.96, match: 'Best Fit', quality: 1 },
      { key: 'accents-value', name: 'Natural texture accent set', retailer: 'Amazon', cost: 268.32, match: 'Best Value', quality: 0.82 },
      { key: 'accents-alt', name: 'Warm neutral decor set', retailer: 'IKEA', cost: 302.64, match: 'Alternate', quality: 0.68 },
    ],
  },
  {
    key: 'cohesion',
    label: 'Cohesion pass',
    category: 'Decor',
    roomZone: 'Room-wide accents',
    allocation: 260,
    products: [
      { key: 'cohesion-fit', name: 'Curated finishing collection', retailer: 'Target', cost: 280.8, match: 'Best Fit', quality: 1 },
      { key: 'cohesion-value', name: 'Minimal finishing collection', retailer: 'Amazon', cost: 223.6, match: 'Best Value', quality: 0.82 },
      { key: 'cohesion-alt', name: 'Nordic finishing collection', retailer: 'IKEA', cost: 252.2, match: 'Alternate', quality: 0.68 },
    ],
  },
]

export const DEMO_PROFILES = [
  {
    key: 'economical',
    title: 'Economical',
    budgetRatio: 0.6,
    description: 'Protect cash and fund the highest-priority changes first.',
    weights: { coverage: 0.22, priority: 0.3, value: 0.42, style: 0.06 },
  },
  {
    key: 'balanced',
    title: 'Balanced',
    budgetRatio: 0.85,
    description: 'Balance room coverage, priority, style fit, and cost efficiency.',
    weights: { coverage: 0.3, priority: 0.28, value: 0.2, style: 0.22 },
  },
  {
    key: 'design-focused',
    title: 'Design Focused',
    budgetRatio: 1,
    description: 'Maximize style impact while staying inside the full budget.',
    weights: { coverage: 0.3, priority: 0.2, value: 0.05, style: 0.45 },
  },
]

const roundMoney = (value) => Math.round(value * 100) / 100

const combinations = (items, index = 0, current = [], result = []) => {
  if (index === items.length) {
    if (current.some(Boolean)) result.push([...current])
    return result
  }

  current.push(null)
  combinations(items, index + 1, current, result)
  current.pop()

  for (const candidate of items[index].products) {
    current.push(candidate)
    combinations(items, index + 1, current, result)
    current.pop()
  }
  return result
}

const scoreCombination = (combination, items, profile) => {
  const selected = combination
    .map((candidate, index) => ({ candidate, index }))
    .filter(({ candidate }) => candidate)
  const priorityWeights = items.map((_, index) => items.length - index)
  const priorityTotal = priorityWeights.reduce((total, value) => total + value, 0)
  const coverage = selected.length / items.length
  const priority = selected.reduce((total, { index }) => total + priorityWeights[index], 0) / priorityTotal
  const value = selected.reduce((total, { candidate, index }) => (
    total + Math.min(1, items[index].allocation / candidate.cost)
  ), 0) / selected.length
  const style = selected.reduce((total, { candidate }) => total + candidate.quality, 0) / selected.length
  const { weights } = profile

  return {
    objective: coverage * weights.coverage
      + priority * weights.priority
      + value * weights.value
      + style * weights.style,
    coverage,
  }
}

const buildScenario = (items, allCombinations, projectBudget, profile) => {
  const ceiling = roundMoney(projectBudget * profile.budgetRatio)
  let best = null
  let evaluated = 0

  for (const combination of allCombinations) {
    const total = roundMoney(combination.reduce((sum, candidate) => sum + (candidate?.cost || 0), 0))
    if (total > ceiling + 0.005) continue
    evaluated += 1
    const score = scoreCombination(combination, items, profile)
    const tieBreaker = profile.key === 'economical' ? -total : total
    if (!best || score.objective > best.score.objective
      || (score.objective === best.score.objective && tieBreaker > best.tieBreaker)) {
      best = { combination, total, score, tieBreaker }
    }
  }

  const selectedItems = []
  const deferredItems = []
  const chosen = best?.combination || items.map(() => null)
  chosen.forEach((candidate, index) => {
    const planItem = items[index]
    if (!candidate) {
      deferredItems.push(planItem.label)
      return
    }
    selectedItems.push({
      ...candidate,
      planItemKey: planItem.key,
      planItemLabel: planItem.label,
      category: planItem.category,
      roomZone: planItem.roomZone,
      priorityRank: index + 1,
    })
  })

  const totalCost = best?.total || 0
  return {
    ...profile,
    budgetCeiling: ceiling,
    totalCost,
    budgetRemaining: roundMoney(projectBudget - totalCost),
    budgetUsagePercent: Math.round((totalCost / projectBudget) * 1000) / 10,
    coverageCount: selectedItems.length,
    coverageTotal: items.length,
    impactScore: Math.round((best?.score.objective || 0) * 1000) / 10,
    items: selectedItems,
    deferredItems,
    evaluated,
  }
}

export const buildDemoOptimization = (projectBudget, items = DEMO_PLAN_ITEMS) => {
  const safeBudget = Math.max(1, Number(projectBudget) || 1)
  const allCombinations = combinations(items)
  const scenarios = DEMO_PROFILES.map((profile) => (
    buildScenario(items, allCombinations, safeBudget, profile)
  ))

  return {
    algorithm: 'Bounded grouped exhaustive search',
    evaluatedCombinations: scenarios.reduce((total, scenario) => total + scenario.evaluated, 0),
    projectBudget: safeBudget,
    hardConstraints: [
      'Never exceed the strategy budget ceiling',
      'Select at most one product per recommendation',
      'Use only products attached to the saved analysis',
    ],
    scenarios,
  }
}
