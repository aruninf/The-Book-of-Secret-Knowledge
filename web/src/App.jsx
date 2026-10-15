import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, ITEMS, byId } from './data.js'

const REPO_URL = 'https://github.com/aruninf/The-Book-of-Secret-Knowledge'

function matches(item, q) {
  const s = `${item.name} ${item.desc}`.toLowerCase()
  return q.split(/\s+/).filter(Boolean).every((w) => s.includes(w))
}

const topicCats = CATEGORIES.filter((c) => c.id !== 'start')

export default function App() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')
  const searchRef = useRef(null)
  const q = query.trim().toLowerCase()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setQuery('')
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const searching = q.length > 0
  const results = useMemo(
    () => ITEMS.filter((i) => (cat === 'all' || i.cat === cat) && (!searching || matches(i, q))),
    [cat, q, searching]
  )
  const shownCats = topicCats.filter((c) => cat === 'all' || c.id === cat)

  return (
    <div className="page">
      <nav className="topnav">
        <a className="brand" href="#top">
          <span className="mark" aria-hidden="true"><BookIcon /></span>
          <span className="brandname">Secret Knowledge</span>
          <span className="brandtag">best-of</span>
        </a>
        <div className="navsearch">
          <SearchIcon />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            aria-label="Search tools"
          />
          <kbd>/</kbd>
        </div>
        <a className="btn" href={REPO_URL} target="_blank" rel="noreferrer">
          <GithubIcon /> <span className="btnhide">Full book</span>
        </a>
      </nav>

      <header className="hero" id="top">
        <p className="kicker">The Book of Secret Knowledge — best-of</p>
        <h1>The tools worth knowing,<br />without the 4,000 lines.</h1>
        <p className="sub">
          A maintainer-curated shortcut to the full book: the most-used tools
          for sysadmins, DevOps and security folks, each explained in one line.
        </p>
        <div className="stats">
          <div className="stat"><strong>{ITEMS.length}</strong><span>hand-picked tools</span></div>
          <div className="stat"><strong>{topicCats.length}</strong><span>topics</span></div>
          <div className="stat"><strong>1-line</strong><span>each, plain English</span></div>
        </div>
        <div className="chips" role="tablist" aria-label="Categories">
          {[{ id: 'all', title: 'All topics' }, ...topicCats].map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              className={cat === c.id ? 'chip on' : 'chip'}
              onClick={() => setCat(c.id)}
            >
              {c.id !== 'all' && <span className="dot" style={{ '--c': c.accent }} />}
              {c.title}
            </button>
          ))}
        </div>
      </header>

      <main>
        {searching ? (
          <section aria-label="Search results">
            <SectionHead title={`Results for “${query.trim()}”`} meta={`${results.length} shown`} accent="#5eead4" />
            {results.length === 0 ? (
              <p className="empty">
                Nothing matches. Try fewer words — or{' '}
                <a href={REPO_URL} target="_blank" rel="noreferrer">search the full book</a>.
              </p>
            ) : (
              <div className="grid">{results.map((item) => <Card key={item.id} item={item} />)}</div>
            )}
          </section>
        ) : (
          <>
            {cat === 'all' && (
              <section aria-label="Start here">
                <SectionHead
                  title="Start here"
                  meta="six picks that teach the fastest habits"
                  accent={CATEGORIES[0].accent}
                />
                <div className="grid">
                  {CATEGORIES[0].picks.map((id) => <Card key={id} item={byId[id]} featured />)}
                </div>
              </section>
            )}
            {shownCats.map((c) => {
              const items = ITEMS.filter((i) => i.cat === c.id)
              if (items.length === 0) return null
              return (
                <section key={c.id} aria-label={c.title} id={`cat-${c.id}`}>
                  <SectionHead title={c.title} meta={`${c.blurb} · ${items.length}`} accent={c.accent} />
                  <div className="grid">{items.map((item) => <Card key={item.id} item={item} />)}</div>
                </section>
              )
            })}
          </>
        )}

        <section className="about" aria-label="About">
          <h2>Why this page exists</h2>
          <p>
            The book is a hoard for people who live in terminals — but newcomers drown
            in it. My take: lead with the tools people reach for weekly, explain each
            in one line of plain English, and keep the deep catalog one click away on
            GitHub. If an entry here ever goes stale, the README is the source of truth.
          </p>
        </section>
      </main>

      <footer>
        <span>
          Best-of viewer for <a href={REPO_URL} target="_blank" rel="noreferrer">the-book-of-secret-knowledge</a> (MIT).
        </span>
        <a href="#top" className="totop">Back to top ↑</a>
      </footer>
    </div>
  )
}

function SectionHead({ title, meta, accent }) {
  return (
    <div className="sechead">
      <span className="bar" style={{ background: accent }} aria-hidden="true" />
      <h2>{title}</h2>
      <span className="hint">{meta}</span>
    </div>
  )
}

function Card({ item, featured }) {
  if (!item) return null
  return (
    <a className={featured ? 'card featured' : 'card'} href={item.url} target="_blank" rel="noreferrer">
      <span className="cardtop">
        <span className="cardname">{item.name}</span>
        <span className="cardgo" aria-hidden="true"><ArrowIcon /></span>
      </span>
      <span className="carddesc">{item.desc}</span>
      <span className="cardfoot">
        <span className="cardhost">{host(item.url)}</span>
      </span>
    </a>
  )
}

function host(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" /><path d="M8 7h9v9" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.15c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}
