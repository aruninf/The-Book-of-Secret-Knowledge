import { useMemo, useState } from 'react'
import { CATEGORIES, ITEMS, byId } from './data.js'

const REPO_URL = 'https://github.com/trimstray/the-book-of-secret-knowledge'

function matches(item, q) {
  const s = `${item.name} ${item.desc}`.toLowerCase()
  return q.split(/\s+/).filter(Boolean).every((w) => s.includes(w))
}

export default function App() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')
  const q = query.trim().toLowerCase()

  const counts = useMemo(() => {
    const m = { all: ITEMS.length }
    for (const i of ITEMS) m[i.cat] = (m[i.cat] || 0) + 1
    return m
  }, [])

  const visible = ITEMS.filter(
    (i) => (cat === 'all' || i.cat === cat) && (!q || matches(i, q))
  )

  const startHere = CATEGORIES.find((c) => c.id === 'start')
  const showStart = cat === 'all' && !q

  return (
    <div className="page">
      <header className="hero">
        <p className="kicker">The Book of Secret Knowledge — best-of</p>
        <h1>Secret Knowledge, minus the scrolling.</h1>
        <p className="sub">
          The README is 4,000+ lines of gold. This page is the 40-link
          shortcut: the most-used tools and the easiest reads, searchable
          in one keystroke. Everything links out; the full book stays on GitHub.
        </p>
        <div className="searchrow">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools… (e.g. dns, tls, log)"
            aria-label="Search tools"
          />
          <a className="ghost" href={REPO_URL} target="_blank" rel="noreferrer">
            Full book on GitHub
          </a>
        </div>
        <div className="chips" role="tablist" aria-label="Categories">
          {[{ id: 'all', title: 'All' }, ...CATEGORIES.filter((c) => c.id !== 'start')].map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              className={cat === c.id ? 'chip on' : 'chip'}
              onClick={() => setCat(c.id)}
            >
              {c.title}
              <span className="n">{c.id === 'all' ? counts.all : counts[c.id] || 0}</span>
            </button>
          ))}
        </div>
      </header>

      <main>
        {showStart && (
          <section aria-label="Start here">
            <h2>Start here <span className="hint">— six picks that teach the fastest habits</span></h2>
            <div className="grid">
              {startHere.picks.map((id) => <Card key={id} item={byId[id]} />)}
            </div>
          </section>
        )}

        <section aria-label="Tools">
          <h2>
            {cat === 'all' ? 'All picks' : CATEGORIES.find((c) => c.id === cat)?.title}
            <span className="hint"> — {visible.length} shown</span>
          </h2>
          {visible.length === 0 ? (
            <p className="empty">
              Nothing matches “{query}”. Try fewer words — or{' '}
              <a href={REPO_URL} target="_blank" rel="noreferrer">search the full book</a>.
            </p>
          ) : (
            <div className="grid">
              {visible.map((item) => <Card key={item.id} item={item} />)}
            </div>
          )}
        </section>

        <section className="about" aria-label="About">
          <h2>Why this page exists</h2>
          <p>
            The book is a maintainer-curated hoard for sysadmins, DevOps and security
            folks — but newcomers drown in it. My take: lead with the tools people
            reach for weekly (curl, nmap, tmux, tldr), make every entry one line of
            plain English, and keep the deep catalog one click away on GitHub.
            If an entry here ever goes stale, the README is the source of truth.
          </p>
        </section>
      </main>

      <footer>
        <span>Best-of viewer for <a href={REPO_URL} target="_blank" rel="noreferrer">the-book-of-secret-knowledge</a> (MIT).</span>
      </footer>
    </div>
  )
}

function Card({ item }) {
  if (!item) return null
  return (
    <a className="card" href={item.url} target="_blank" rel="noreferrer">
      <span className="cardname">{item.name}</span>
      <span className="carddesc">{item.desc}</span>
      <span className="cardgo" aria-hidden="true">↗</span>
    </a>
  )
}
