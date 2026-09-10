import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  Github,
  Layers3,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { buildDemoOptimization } from '../demo/demoOptimizer'
import './PortfolioDemo.css'

const REPOSITORY_URL = 'https://github.com/calebponce/Home-4-U'
const STARTING_BUDGET = 2600
const SIGNALS = [
  { label: 'Natural materials', confidence: 96 },
  { label: 'Cozy atmosphere', confidence: 91 },
  { label: 'Light wood', confidence: 88 },
  { label: 'Functional layout', confidence: 84 },
]

const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
}).format(value || 0)

const percentage = (weight) => `${Math.round(weight * 100)}%`

function PortfolioDemo() {
  const [budget, setBudget] = useState(STARTING_BUDGET)
  const [activeKey, setActiveKey] = useState('balanced')
  const optimization = useMemo(() => buildDemoOptimization(budget), [budget])
  const activeScenario = optimization.scenarios.find(({ key }) => key === activeKey)
    || optimization.scenarios[1]

  useEffect(() => {
    const previousScene = document.body.dataset.scene
    const previousTitle = document.title
    document.body.dataset.scene = 'portfolio-demo'
    document.title = 'Home4U — Interactive Portfolio Demo'
    return () => {
      if (previousScene) document.body.dataset.scene = previousScene
      else delete document.body.dataset.scene
      document.title = previousTitle
    }
  }, [])

  const resetDemo = () => {
    setBudget(STARTING_BUDGET)
    setActiveKey('balanced')
  }

  return (
    <div className="portfolio-demo" id="top">
      <a className="portfolio-demo__skip" href="#demo-main">Skip to the case study</a>

      <header className="portfolio-demo__nav-shell">
        <a className="portfolio-demo__brand" href="#top" aria-label="Home4U portfolio demo home">
          <span className="portfolio-demo__brand-mark">H4</span>
          <span>
            <strong>Home4U</strong>
            <small>Interactive case study</small>
          </span>
        </a>
        <nav className="portfolio-demo__nav" aria-label="Portfolio demo navigation">
          <a href="#optimizer">Optimizer</a>
          <a href="#engineering">Engineering</a>
          <a className="portfolio-demo__source-link" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
            <Github size={16} aria-hidden="true" /> Source <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main id="demo-main">
        <section className="portfolio-demo__hero" aria-labelledby="portfolio-demo-title">
          <div className="portfolio-demo__hero-copy">
            <p className="portfolio-demo__kicker"><span /> Live portfolio build · No sign-in required</p>
            <h1 id="portfolio-demo-title">
              From room signals to a <em>constraint-valid</em> buying plan.
            </h1>
            <p className="portfolio-demo__hero-lede">
              Home4U turns a room scan, design direction, and hard budget into three
              explainable purchasing strategies. Adjust the budget below to run the
              decision engine directly in your browser.
            </p>
            <div className="portfolio-demo__hero-actions">
              <a className="portfolio-demo__primary-action" href="#optimizer">
                Run the optimizer <ArrowDown size={16} aria-hidden="true" />
              </a>
              <a className="portfolio-demo__secondary-action" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
                Inspect the full stack <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
            <ul className="portfolio-demo__stack" aria-label="Technology stack">
              <li>React 19</li>
              <li>FastAPI</li>
              <li>SQLAlchemy</li>
              <li>GitHub Actions</li>
            </ul>
          </div>

          <div className="portfolio-demo__analysis-card" aria-label="Representative room analysis">
            <div className="portfolio-demo__analysis-topline">
              <span><ScanLine size={15} aria-hidden="true" /> Saved room analysis</span>
              <span className="portfolio-demo__live-indicator">Validated</span>
            </div>
            <div className="portfolio-demo__analysis-main">
              <div className="portfolio-demo__score-ring" aria-label="87 percent Scandinavian style alignment">
                <span>87<small>%</small></span>
                <p>Style alignment</p>
              </div>
              <div>
                <p className="portfolio-demo__mini-label">Selected direction</p>
                <h2>Scandinavian living room</h2>
                <p>A warm, functional room built around light materials and restrained contrast.</p>
              </div>
            </div>
            <div className="portfolio-demo__signals">
              {SIGNALS.map((signal) => (
                <div key={signal.label}>
                  <span>{signal.label}</span>
                  <strong>{signal.confidence}%</strong>
                  <i aria-hidden="true"><b style={{ width: `${signal.confidence}%` }} /></i>
                </div>
              ))}
            </div>
            <div className="portfolio-demo__next-move">
              <span>01</span>
              <div>
                <small>Highest-impact move</small>
                <strong>Main seating anchor</strong>
              </div>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="portfolio-demo__proof-strip" aria-label="Project evidence">
          <div><strong>3</strong><span>Distinct strategies</span></div>
          <div><strong>{optimization.evaluatedCombinations.toLocaleString()}</strong><span>Valid combinations at {formatCurrency(budget)}</span></div>
          <div><strong>3</strong><span>Hard constraints enforced</span></div>
          <div><strong>27</strong><span>Frontend checks</span></div>
        </section>

        <section className="portfolio-demo__optimizer" id="optimizer" aria-labelledby="optimizer-demo-title">
          <div className="portfolio-demo__section-heading">
            <div>
              <p className="portfolio-demo__kicker"><span /> Decision engine</p>
              <h2 id="optimizer-demo-title">One room. Three defensible plans.</h2>
            </div>
            <p>
              This interactive demo runs the same bounded search model used by the backend
              against a representative saved analysis. Prices are planning estimates.
            </p>
          </div>

          <div className="portfolio-demo__budget-control">
            <div className="portfolio-demo__budget-copy">
              <SlidersHorizontal size={19} aria-hidden="true" />
              <div>
                <label htmlFor="portfolio-budget">Project budget</label>
                <span>Change the ceiling to recompute every strategy.</span>
              </div>
            </div>
            <output htmlFor="portfolio-budget">{formatCurrency(budget)}</output>
            <input
              id="portfolio-budget"
              type="range"
              min="1600"
              max="4200"
              step="100"
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
            />
            <div className="portfolio-demo__range-labels" aria-hidden="true">
              <span>$1,600</span><span>$4,200</span>
            </div>
          </div>

          <div className="portfolio-demo__constraints" aria-label="Optimizer hard constraints">
            {optimization.hardConstraints.map((constraint) => (
              <span key={constraint}><ShieldCheck size={15} aria-hidden="true" /> {constraint}</span>
            ))}
          </div>

          <div className="portfolio-demo__strategy-tabs" role="tablist" aria-label="Purchasing strategies">
            {optimization.scenarios.map((scenario) => {
              const selected = scenario.key === activeScenario.key
              return (
                <button
                  key={scenario.key}
                  id={`portfolio-tab-${scenario.key}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="portfolio-strategy-panel"
                  className={selected ? 'is-active' : ''}
                  onClick={() => setActiveKey(scenario.key)}
                >
                  <span>{scenario.title}</span>
                  <strong>{formatCurrency(scenario.totalCost)}</strong>
                  <small>{scenario.coverageCount}/{scenario.coverageTotal} steps funded</small>
                  <i aria-hidden="true"><b style={{ width: `${Math.min(100, scenario.budgetUsagePercent)}%` }} /></i>
                  <small>{Math.round(scenario.budgetUsagePercent)}% of project budget</small>
                </button>
              )
            })}
          </div>

          <div
            className="portfolio-demo__strategy-panel"
            id="portfolio-strategy-panel"
            role="tabpanel"
            aria-label={`${activeScenario.title} purchasing strategy`}
            aria-live="polite"
          >
            <div className="portfolio-demo__strategy-summary">
              <div>
                <p className="portfolio-demo__mini-label">{activeScenario.title} objective</p>
                <h3>{activeScenario.description}</h3>
                <p className="portfolio-demo__formula">
                  {percentage(activeScenario.weights.coverage)} coverage +{' '}
                  {percentage(activeScenario.weights.priority)} priority +{' '}
                  {percentage(activeScenario.weights.value)} value +{' '}
                  {percentage(activeScenario.weights.style)} style fit
                </p>
              </div>
              <dl>
                <div><dt>Strategy ceiling</dt><dd>{formatCurrency(activeScenario.budgetCeiling)}</dd></div>
                <div><dt>Project budget left</dt><dd>{formatCurrency(activeScenario.budgetRemaining)}</dd></div>
                <div><dt>Impact score</dt><dd>{Math.round(activeScenario.impactScore)}/100</dd></div>
              </dl>
            </div>

            <div className="portfolio-demo__product-grid">
              {activeScenario.items.map((item) => (
                <article key={`${activeScenario.key}-${item.planItemKey}`}>
                  <div className="portfolio-demo__product-topline">
                    <span>Priority {item.priorityRank}</span>
                    <span>{item.match}</span>
                  </div>
                  <h4>{item.name}</h4>
                  <p>{item.planItemLabel} · {item.roomZone}</p>
                  <footer><span>{item.retailer}</span><strong>{formatCurrency(item.cost)}</strong></footer>
                </article>
              ))}
            </div>

            {activeScenario.deferredItems.length > 0 && (
              <p className="portfolio-demo__tradeoff">
                <strong>Deferred to satisfy this ceiling:</strong>{' '}
                {activeScenario.deferredItems.join(', ')}.
              </p>
            )}
          </div>

          <button className="portfolio-demo__reset" type="button" onClick={resetDemo}>
            Reset representative case
          </button>
        </section>

        <section className="portfolio-demo__engineering" id="engineering" aria-labelledby="engineering-title">
          <div className="portfolio-demo__section-heading">
            <div>
              <p className="portfolio-demo__kicker"><span /> Engineering proof</p>
              <h2 id="engineering-title">Designed to be inspected.</h2>
            </div>
            <p>
              The public demo is static and cost-free. The repository preserves the full
              authenticated React/FastAPI system, relational models, migrations, tests, and deployment history.
            </p>
          </div>

          <div className="portfolio-demo__architecture" aria-label="Home4U system flow">
            <div><ScanLine aria-hidden="true" /><span>01</span><strong>Room signals</strong><small>Image profile + user intent</small></div>
            <ArrowRight aria-hidden="true" />
            <div><Sparkles aria-hidden="true" /><span>02</span><strong>Style scoring</strong><small>Weighted, explainable match</small></div>
            <ArrowRight aria-hidden="true" />
            <div><SlidersHorizontal aria-hidden="true" /><span>03</span><strong>Constraint search</strong><small>Grouped exhaustive evaluation</small></div>
            <ArrowRight aria-hidden="true" />
            <div><Layers3 aria-hidden="true" /><span>04</span><strong>Actionable plans</strong><small>Three visible tradeoffs</small></div>
          </div>

          <div className="portfolio-demo__engineering-grid">
            <article>
              <ShieldCheck aria-hidden="true" />
              <p className="portfolio-demo__mini-label">Reproducible decisions</p>
              <h3>Deterministic by design</h3>
              <p>The same inputs produce the same ranked plan, making the result testable and auditable.</p>
            </article>
            <article>
              <CircleDollarSign aria-hidden="true" />
              <p className="portfolio-demo__mini-label">Real constraints</p>
              <h3>Budget means budget</h3>
              <p>Every returned plan is validated against its ceiling before it reaches the interface.</p>
            </article>
            <article>
              <Check aria-hidden="true" />
              <p className="portfolio-demo__mini-label">Delivery confidence</p>
              <h3>CI-gated changes</h3>
              <p>Frontend tests, accessibility checks, lint, builds, migrations, and API suites run on every push.</p>
            </article>
          </div>
        </section>

        <section className="portfolio-demo__closing">
          <div>
            <p className="portfolio-demo__kicker"><span /> Case study</p>
            <h2>Product judgment backed by engineering evidence.</h2>
          </div>
          <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
            Review the implementation <Github size={17} aria-hidden="true" />
          </a>
        </section>
      </main>

      <footer className="portfolio-demo__footer">
        <div>
          <strong>Home4U</strong>
          <span>Portfolio demo · Representative data · No information is collected</span>
        </div>
        <p>Caleb Ponce · Team Lead / System Architecture · CSC 648/848</p>
      </footer>
    </div>
  )
}

export default PortfolioDemo
