import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDemoOptimization } from './demoOptimizer.js'

test('demo optimizer reproduces three distinct constraint-valid strategies', () => {
  const result = buildDemoOptimization(2600)
  const [economical, balanced, designFocused] = result.scenarios

  assert.equal(result.algorithm, 'Bounded grouped exhaustive search')
  assert.ok(result.evaluatedCombinations > 0)
  assert.deepEqual(result.scenarios.map(({ key }) => key), [
    'economical',
    'balanced',
    'design-focused',
  ])
  assert.equal(economical.totalCost, 1520.48)
  assert.equal(balanced.totalCost, 2206.88)
  assert.equal(designFocused.totalCost, 2527.2)
  assert.ok(economical.coverageCount < designFocused.coverageCount)
})

test('every demo strategy respects its hard constraints across the budget range', () => {
  for (const budget of [1600, 2600, 4200]) {
    const result = buildDemoOptimization(budget)
    for (const scenario of result.scenarios) {
      assert.ok(scenario.totalCost <= scenario.budgetCeiling)
      assert.ok(scenario.budgetRemaining >= 0)
      assert.equal(
        new Set(scenario.items.map(({ planItemKey }) => planItemKey)).size,
        scenario.items.length,
      )
    }
  }
})

test('demo optimization is deterministic', () => {
  assert.deepEqual(buildDemoOptimization(3100), buildDemoOptimization(3100))
})
