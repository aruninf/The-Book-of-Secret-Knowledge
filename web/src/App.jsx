import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, ITEMS, ALL_TAGS, byId } from './data.js'

const REPO_URL = 'https://github.com/aruninf/The-Book-of-Secret-Knowledge'
const PROFILE_URL = 'https://github.com/aruninf'

function highlightMatch(text, query) {
  if (!query || !text) return text
  const parts = query.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return text
  const escaped = parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const segments = text.split(regex)
  return segments.map((seg, i) =>
    regex.test(seg) ? (
      <mark key={i} className="hl">
        {seg}
      </mark>
    ) : (
      seg
    )
  )
}

function matches(item, q) {
  const words = q.split(/\s+/).filter(Boolean)
  const haystack = `${item.name} ${item.desc} ${item.type || ''} ${(item.tags || []).join(' ')} ${item.command || ''} ${item.highlight || ''} ${item.useCase || ''}`.toLowerCase()
  return words.every((w) => haystack.includes(w))
}

const topicCats = CATEGORIES.filter((c) => c.id !== 'start')

export default function App() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState('curated') // 'curated' | 'az' | 'cat'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'compact'
  const [activeItem, setActiveItem] = useState(null)
  const [toast, setToast] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('secret_knowledge_favs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('secret_knowledge_theme')
      if (saved) return saved
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
    } catch {
      return 'dark'
    }
  })

  const searchRef = useRef(null)
  const toastTimeoutRef = useRef(null)
  const q = query.trim().toLowerCase()

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('secret_knowledge_theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem('secret_knowledge_favs', JSON.stringify(favorites))
    } catch {
      // ignore
    }
  }, [favorites])

  // Keyboard shortcut listener
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        if (activeItem) {
          setActiveItem(null)
        } else if (document.activeElement === searchRef.current) {
          setQuery('')
          searchRef.current?.blur()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeItem])

  // Lock body scroll when modal is active
  useEffect(() => {
    if (activeItem) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeItem])

  const showToast = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast(message)
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 2200)
  }

  const toggleFavorite = (id, e) => {
    e?.stopPropagation()
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      showToast(next.includes(id) ? 'Saved to your toolkit ★' : 'Removed from saved')
      return next
    })
  }

  const copyText = async (text, label = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text)
      showToast(label)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast(label)
    }
  }

  const exportFavorites = () => {
    const favItems = ITEMS.filter((i) => favorites.includes(i.id))
    if (favItems.length === 0) {
      showToast('No saved tools yet!')
      return
    }
    const md = favItems
      .map(
        (i) =>
          `- [${i.name}](${i.url}) — ${i.desc}${i.command ? ` \`${i.command}\`` : ''}`
      )
      .join('\n')
    copyText(md, `Exported ${favItems.length} saved tools as Markdown!`)
  }

  const searching = q.length > 0
  const isFavoritesView = cat === 'saved'

  // Filter & Sort
  const filteredItems = useMemo(() => {
    let list = ITEMS.filter((i) => {
      if (isFavoritesView) {
        if (!favorites.includes(i.id)) return false
      } else if (cat !== 'all') {
        if (i.cat !== cat) return false
      }
      if (selectedTag !== 'all' && !(i.tags || []).includes(selectedTag)) {
        return false
      }
      if (searching && !matches(i, q)) {
        return false
      }
      return true
    })

    if (sortBy === 'az') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'cat') {
      list = [...list].sort((a, b) => a.cat.localeCompare(b.cat))
    }
    return list
  }, [cat, isFavoritesView, favorites, selectedTag, searching, q, sortBy])

  const shownCats = topicCats.filter((c) => cat === 'all' || c.id === cat)

  return (
    <div className="page">
      {/* Toast Notification */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span className="toast-icon">✨</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Detail Modal / Drawer */}
      {activeItem && (
        <ToolModal
          item={activeItem}
          isFav={favorites.includes(activeItem.id)}
          onToggleFav={(e) => toggleFavorite(activeItem.id, e)}
          onClose={() => setActiveItem(null)}
          onCopy={copyText}
          onSelectTag={(tag) => {
            setSelectedTag(tag)
            setActiveItem(null)
          }}
          onSelectTool={(tool) => setActiveItem(tool)}
        />
      )}

      {/* Sticky Navigation */}
      <nav className="topnav">
        <div className="brand-group">
          <a className="brand" href="#top">
            <span className="mark" aria-hidden="true">
              <BookIcon />
            </span>
            <span className="brandname">Secret Knowledge</span>
            <span className="brandtag">Best-of</span>
          </a>
          <a
            className="brand-author"
            href={PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            title="Curated by @aruninf on GitHub"
          >
            <span>by</span>
            <strong>@aruninf</strong>
          </a>
        </div>

        <div className="navsearch">
          <SearchIcon />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, commands, tags… (Press /)"
            aria-label="Search tools"
          />
          {query ? (
            <button
              className="search-clear-btn"
              onClick={() => {
                setQuery('')
                searchRef.current?.focus()
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : (
            <kbd className="search-kbd">/</kbd>
          )}
        </div>

        <div className="nav-actions">
          <button
            className={`btn-icon ${isFavoritesView ? 'active' : ''}`}
            onClick={() => setCat(isFavoritesView ? 'all' : 'saved')}
            title="Saved Tools"
            aria-label="Saved Tools"
          >
            <StarIcon filled={favorites.length > 0} />
            {favorites.length > 0 && <span className="badge-count">{favorites.length}</span>}
          </button>

          <button
            className="btn-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <a className="btn btn-github" href={REPO_URL} target="_blank" rel="noreferrer">
            <GithubIcon />
            <span className="btnhide">Full Book</span>
          </a>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="hero" id="top">
        <div className="hero-badge">
          <span className="hero-sparkle">✨</span>
          <span>
            Curated by{' '}
            <a href={PROFILE_URL} target="_blank" rel="noreferrer" className="hero-author-link">
              @aruninf
            </a>{' '}
            · The Book of Secret Knowledge
          </span>
        </div>
        <h1>
          The tools worth knowing,<br />
          <span className="text-gradient">served attractively</span>.
        </h1>
        <p className="sub">
          A readable shortcut to the 4,000-line Book of Secret Knowledge. Inspect actionable
          commands, cheat sheet snippets, tags, and practical superpowers without direct link traps.
        </p>

        {/* Dynamic Stats Row */}
        <div className="stats">
          <div className="stat">
            <strong>{ITEMS.length}</strong>
            <span>Curated Tools</span>
          </div>
          <div className="stat">
            <strong>{topicCats.length}</strong>
            <span>Core Topics</span>
          </div>
          <div className="stat">
            <strong>{ALL_TAGS.length}</strong>
            <span>Searchable Tags</span>
          </div>
          <div className="stat highlight-stat" onClick={() => setCat('saved')}>
            <strong>{favorites.length}</strong>
            <span>Your Saved ★</span>
          </div>
        </div>

        {/* Controls & Filter Bar */}
        <div className="controls-bar">
          <div className="chips" role="tablist" aria-label="Categories">
            <button
              role="tab"
              aria-selected={cat === 'all'}
              className={cat === 'all' ? 'chip on' : 'chip'}
              onClick={() => {
                setCat('all')
                setSelectedTag('all')
              }}
            >
              All Topics
            </button>

            <button
              role="tab"
              aria-selected={cat === 'saved'}
              className={cat === 'saved' ? 'chip on fav-chip' : 'chip fav-chip'}
              onClick={() => setCat('saved')}
            >
              <StarIcon filled={favorites.length > 0} size={13} />
              Saved ({favorites.length})
            </button>

            {topicCats.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={cat === c.id}
                className={cat === c.id ? 'chip on' : 'chip'}
                onClick={() => setCat(c.id)}
              >
                <span className="chip-icon">{c.icon}</span>
                <span className="dot" style={{ '--c': c.accent }} />
                {c.title}
              </button>
            ))}
          </div>

          <div className="secondary-controls">
            {/* Tag Selector */}
            <div className="select-wrapper">
              <label htmlFor="tag-filter" className="sr-only">
                Filter by tag
              </label>
              <select
                id="tag-filter"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="control-select"
              >
                <option value="all">All Tags ({ALL_TAGS.length})</option>
                {ALL_TAGS.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="select-wrapper">
              <label htmlFor="sort-select" className="sr-only">
                Sort tools
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="control-select"
              >
                <option value="curated">Curated Order</option>
                <option value="az">Name (A → Z)</option>
                <option value="cat">By Category</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="view-toggle" role="group" aria-label="View layout">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Cards view"
                aria-label="Grid view"
              >
                <GridIcon />
              </button>
              <button
                className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
                onClick={() => setViewMode('compact')}
                title="Compact list view"
                aria-label="List view"
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {isFavoritesView && (
          <div className="favorites-header">
            <div className="fav-title-wrap">
              <h2>Your Saved Toolkit</h2>
              <p>Tools you have bookmarked for quick access and reference.</p>
            </div>
            {favorites.length > 0 && (
              <button className="btn btn-export" onClick={exportFavorites}>
                <ShareIcon /> Export as Markdown
              </button>
            )}
          </div>
        )}

        {/* Searching or Filtered state */}
        {searching || selectedTag !== 'all' || isFavoritesView || sortBy !== 'curated' ? (
          <section aria-label="Filtered results">
            <SectionHead
              title={
                isFavoritesView
                  ? `Saved Items (${filteredItems.length})`
                  : searching
                  ? `Search Results for “${query.trim()}”`
                  : `Filtered: #${selectedTag}`
              }
              meta={`${filteredItems.length} tool${filteredItems.length === 1 ? '' : 's'} found`}
              accent="#5eead4"
            />

            {(selectedTag !== 'all' || searching) && (
              <div className="active-filters-row">
                {selectedTag !== 'all' && (
                  <span className="active-filter-pill">
                    Tag: <strong>#{selectedTag}</strong>
                    <button
                      onClick={() => setSelectedTag('all')}
                      title="Clear tag filter"
                      aria-label="Clear tag filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {searching && (
                  <span className="active-filter-pill">
                    Query: <strong>“{query.trim()}”</strong>
                    <button
                      onClick={() => setQuery('')}
                      title="Clear query"
                      aria-label="Clear query"
                    >
                      ✕
                    </button>
                  </span>
                )}
                <button
                  className="clear-all-text-btn"
                  onClick={() => {
                    setQuery('')
                    setSelectedTag('all')
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}

            {filteredItems.length === 0 ? (
              <div className="empty">
                <p className="empty-title">
                  {isFavoritesView
                    ? 'No saved tools yet!'
                    : `No tools match your criteria.`}
                </p>
                <p className="empty-sub">
                  {isFavoritesView
                    ? 'Click the star icon (★) on any tool card to save it to your personal quick-access kit.'
                    : 'Try clearing your query or filters, or explore the complete repository.'}
                </p>
                <div className="empty-actions">
                  <button
                    className="btn"
                    onClick={() => {
                      setQuery('')
                      setSelectedTag('all')
                      setCat('all')
                    }}
                  >
                    Reset all filters
                  </button>
                  <a className="btn btn-primary" href={REPO_URL} target="_blank" rel="noreferrer">
                    Search 4,000-line README ↗
                  </a>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    query={query}
                    isFav={favorites.includes(item.id)}
                    onToggleFav={(e) => toggleFavorite(item.id, e)}
                    onCopy={copyText}
                    onOpenModal={() => setActiveItem(item)}
                    onSelectTag={(t) => setSelectedTag(t)}
                  />
                ))}
              </div>
            ) : (
              <div className="list-view">
                {filteredItems.map((item) => (
                  <CompactRow
                    key={item.id}
                    item={item}
                    query={query}
                    isFav={favorites.includes(item.id)}
                    onToggleFav={(e) => toggleFavorite(item.id, e)}
                    onCopy={copyText}
                    onOpenModal={() => setActiveItem(item)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Default Curated Sections */
          <>
            {cat === 'all' && (
              <section aria-label="Start here">
                <SectionHead
                  title="Start here"
                  meta="six picks that teach the fastest habits"
                  accent={CATEGORIES[0].accent}
                />
                <div className={viewMode === 'grid' ? 'grid' : 'list-view'}>
                  {CATEGORIES[0].picks.map((id) => {
                    const item = byId[id]
                    if (!item) return null
                    return viewMode === 'grid' ? (
                      <Card
                        key={id}
                        item={item}
                        query={query}
                        featured
                        isFav={favorites.includes(item.id)}
                        onToggleFav={(e) => toggleFavorite(item.id, e)}
                        onCopy={copyText}
                        onOpenModal={() => setActiveItem(item)}
                        onSelectTag={(t) => setSelectedTag(t)}
                      />
                    ) : (
                      <CompactRow
                        key={id}
                        item={item}
                        query={query}
                        isFav={favorites.includes(item.id)}
                        onToggleFav={(e) => toggleFavorite(item.id, e)}
                        onCopy={copyText}
                        onOpenModal={() => setActiveItem(item)}
                      />
                    )
                  })}
                </div>
              </section>
            )}

            {shownCats.map((c) => {
              const items = ITEMS.filter((i) => i.cat === c.id)
              if (items.length === 0) return null
              return (
                <section key={c.id} aria-label={c.title} id={`cat-${c.id}`}>
                  <SectionHead
                    title={`${c.icon} ${c.title}`}
                    meta={`${c.blurb} · ${items.length} tools`}
                    accent={c.accent}
                  />
                  <div className={viewMode === 'grid' ? 'grid' : 'list-view'}>
                    {items.map((item) =>
                      viewMode === 'grid' ? (
                        <Card
                          key={item.id}
                          item={item}
                          query={query}
                          isFav={favorites.includes(item.id)}
                          onToggleFav={(e) => toggleFavorite(item.id, e)}
                          onCopy={copyText}
                          onOpenModal={() => setActiveItem(item)}
                          onSelectTag={(t) => setSelectedTag(t)}
                        />
                      ) : (
                        <CompactRow
                          key={item.id}
                          item={item}
                          query={query}
                          isFav={favorites.includes(item.id)}
                          onToggleFav={(e) => toggleFavorite(item.id, e)}
                          onCopy={copyText}
                          onOpenModal={() => setActiveItem(item)}
                        />
                      )
                    )}
                  </div>
                </section>
              )
            })}
          </>
        )}

        {/* Information & Purpose */}
        <section className="about" aria-label="About">
          <div className="about-glow" />
          <h2>Why this custom view exists</h2>
          <p>
            The Book of Secret Knowledge is an invaluable hoard for terminal dwellers, sysadmins,
            and security pros — but raw markdown lists can be overwhelming to scan.
            Maintained and crafted with care by{' '}
            <a href={PROFILE_URL} target="_blank" rel="noreferrer" className="inline-author-link">
              <strong>@aruninf</strong>
            </a>
            , this viewer serves actionable knowledge: practical copyable commands, real-world
            use cases, tags, and quick-filter tools so you can learn fast without losing your place.
          </p>
          <div className="about-links">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-sm">
              <GithubIcon /> Star Repo on GitHub
            </a>
            <a href={PROFILE_URL} target="_blank" rel="noreferrer" className="btn btn-sm btn-author">
              <GithubIcon /> Follow @aruninf
            </a>
            <button className="btn btn-sm" onClick={() => copyText(window.location.href, 'Page link copied!')}>
              <ShareIcon /> Share Best-of App
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-left">
          <span>
            Curated with ⚡ by{' '}
            <a href={PROFILE_URL} target="_blank" rel="noreferrer" className="footer-author-link">
              <strong>@aruninf</strong>
            </a>{' '}
            • Forked from{' '}
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              the-book-of-secret-knowledge
            </a>{' '}
            (MIT).
          </span>
          <span className="footer-sub">Press <kbd>/</kbd> to search anytime.</span>
        </div>
        <a href="#top" className="totop">
          Back to top ↑
        </a>
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

/* Rich Card Component with customized presentation */
function Card({ item, query, featured, isFav, onToggleFav, onCopy, onOpenModal, onSelectTag }) {
  if (!item) return null
  const catObj = CATEGORIES.find((c) => c.id === item.cat)

  return (
    <div
      className={`card ${featured ? 'featured' : ''}`}
      onClick={onOpenModal}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpenModal()
      }}
    >
      {/* Top Bar: Badges + Favorite */}
      <div className="cardtop">
        <div className="card-badges">
          <span className="type-badge" style={{ '--accent-color': catObj?.accent || 'var(--accent)' }}>
            {item.type || 'Tool'}
          </span>
          {featured && <span className="featured-badge">Featured Pick</span>}
        </div>
        <button
          className={`fav-btn ${isFav ? 'active' : ''}`}
          onClick={onToggleFav}
          title={isFav ? 'Remove from saved' : 'Save tool'}
          aria-label={isFav ? 'Remove from saved' : 'Save tool'}
        >
          <StarIcon filled={isFav} size={15} />
        </button>
      </div>

      {/* Title & Description */}
      <div className="card-main">
        <h3 className="cardname">{highlightMatch(item.name, query)}</h3>
        <p className="carddesc">{highlightMatch(item.desc, query)}</p>
      </div>

      {/* Superpower Highlight */}
      {item.highlight && (
        <div className="card-highlight">
          <span className="sparkle-icon">💡</span>
          <span>{highlightMatch(item.highlight, query)}</span>
        </div>
      )}

      {/* Quick Terminal Command */}
      {item.command && (
        <div
          className="card-cmd-box"
          onClick={(e) => {
            e.stopPropagation()
            onCopy(item.command, `Copied command: ${item.command}`)
          }}
          title="Click to copy command"
        >
          <span className="cmd-prompt">$</span>
          <code className="cmd-code">{highlightMatch(item.command, query)}</code>
          <button
            className="cmd-copy-btn"
            aria-label="Copy command"
            onClick={(e) => {
              e.stopPropagation()
              onCopy(item.command, `Copied command: ${item.command}`)
            }}
          >
            <CopyIcon />
          </button>
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="card-tags">
          {item.tags.map((tag) => (
            <button
              key={tag}
              className="tag-pill"
              onClick={(e) => {
                e.stopPropagation()
                onSelectTag(tag)
              }}
              title={`Filter by #${tag}`}
            >
              #{highlightMatch(tag, query)}
            </button>
          ))}
        </div>
      )}

      {/* Footer / Actions */}
      <div className="cardfoot">
        <span className="cardhost">{host(item.url)}</span>
        <div className="card-actions">
          <button
            className="btn-card-action"
            onClick={(e) => {
              e.stopPropagation()
              onOpenModal()
            }}
          >
            Inspect Details
          </button>
          <a
            className="cardgo"
            href={item.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open official site"
            aria-label={`Open ${item.name} website`}
          >
            <ArrowIcon />
          </a>
        </div>
      </div>
    </div>
  )
}

/* Compact List Row */
function CompactRow({ item, query, isFav, onToggleFav, onCopy, onOpenModal }) {
  const catObj = CATEGORIES.find((c) => c.id === item.cat)

  return (
    <div className="compact-row" onClick={onOpenModal}>
      <button
        className={`fav-btn-compact ${isFav ? 'active' : ''}`}
        onClick={onToggleFav}
        title={isFav ? 'Remove from saved' : 'Save tool'}
        aria-label="Save tool"
      >
        <StarIcon filled={isFav} size={14} />
      </button>

      <div className="compact-name-wrap">
        <strong className="compact-name">{highlightMatch(item.name, query)}</strong>
        <span className="compact-type" style={{ borderColor: catObj?.accent }}>
          {item.type}
        </span>
      </div>

      <div className="compact-desc">{highlightMatch(item.desc, query)}</div>

      {item.command && (
        <div
          className="compact-cmd"
          onClick={(e) => {
            e.stopPropagation()
            onCopy(item.command, `Copied command: ${item.command}`)
          }}
          title="Click to copy command"
        >
          <code>{item.command}</code>
          <CopyIcon size={12} />
        </div>
      )}

      <div className="compact-actions">
        <button
          className="btn-details-sm"
          onClick={(e) => {
            e.stopPropagation()
            onOpenModal()
          }}
        >
          Details
        </button>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="compact-link"
          onClick={(e) => e.stopPropagation()}
          title="Open site ↗"
          aria-label="Open site"
        >
          <ArrowIcon />
        </a>
      </div>
    </div>
  )
}

/* Tool Detail Modal / Drawer */
function ToolModal({ item, isFav, onToggleFav, onClose, onCopy, onSelectTag, onSelectTool }) {
  const catObj = CATEGORIES.find((c) => c.id === item.cat)
  const relatedTools = useMemo(() => {
    return ITEMS.filter((i) => i.cat === item.cat && i.id !== item.id).slice(0, 4)
  }, [item])

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-badges">
              <span className="type-badge" style={{ '--accent-color': catObj?.accent || 'var(--accent)' }}>
                {catObj?.icon} {item.type || 'Tool'}
              </span>
              <span className="modal-cat-name">{catObj?.title}</span>
            </div>
            <h2>{item.name}</h2>
          </div>

          <div className="modal-header-actions">
            <button
              className={`fav-btn-modal ${isFav ? 'active' : ''}`}
              onClick={onToggleFav}
              title={isFav ? 'Remove from saved' : 'Save tool'}
            >
              <StarIcon filled={isFav} size={18} />
              <span>{isFav ? 'Saved' : 'Save'}</span>
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <p className="modal-desc">{item.desc}</p>

          {/* Superpower Highlight */}
          {item.highlight && (
            <div className="modal-callout">
              <div className="callout-title">
                <span>⚡</span>
                <strong>Key Superpower</strong>
              </div>
              <p>{item.highlight}</p>
            </div>
          )}

          {/* Real-World Use Case */}
          {item.useCase && (
            <div className="modal-section">
              <h4>When to Reach for This</h4>
              <p className="usecase-text">{item.useCase}</p>
            </div>
          )}

          {/* Quick Command */}
          {item.command && (
            <div className="modal-section">
              <div className="modal-sec-head">
                <h4>Quick Usage Snippet</h4>
                <button
                  className="btn-copy-link"
                  onClick={() => onCopy(item.command, 'Copied command to clipboard!')}
                >
                  <CopyIcon size={13} /> Copy Command
                </button>
              </div>
              <div className="modal-code-block">
                <span className="cmd-prompt">$</span>
                <code>{item.command}</code>
              </div>
            </div>
          )}

          {/* Installation Hint */}
          {item.install && (
            <div className="modal-section">
              <div className="modal-sec-head">
                <h4>Installation / Access</h4>
                <button
                  className="btn-copy-link"
                  onClick={() => onCopy(item.install, 'Copied install hint!')}
                >
                  <CopyIcon size={13} /> Copy
                </button>
              </div>
              <div className="modal-code-block alt">
                <code>{item.install}</code>
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="modal-section">
              <h4>Topics & Tags</h4>
              <div className="modal-tags">
                {item.tags.map((tag) => (
                  <button key={tag} className="tag-pill" onClick={() => onSelectTag(tag)}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div className="modal-section related-section">
              <h4>More in {catObj?.title}</h4>
              <div className="related-grid">
                {relatedTools.map((rel) => (
                  <div
                    key={rel.id}
                    className="related-card"
                    onClick={() => onSelectTool(rel)}
                    role="button"
                    tabIndex={0}
                  >
                    <strong>{rel.name}</strong>
                    <span>{rel.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="modal-footer-left">
            <button
              className="btn btn-sm"
              onClick={() => {
                const md = `[${item.name}](${item.url}) — ${item.desc}`
                onCopy(md, 'Copied Markdown reference!')
              }}
            >
              <ShareIcon /> Copy Markdown Ref
            </button>
            <button
              className="btn btn-sm"
              onClick={() => onCopy(item.url, 'Copied URL to clipboard!')}
            >
              <CopyIcon size={13} /> Copy Link
            </button>
          </div>

          <a className="btn btn-primary" href={item.url} target="_blank" rel="noreferrer">
            <span>Visit {item.name}</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
    </div>
  )
}

function host(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/* SVG Icons */
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

function CopyIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function StarIcon({ filled = false, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#f59e0b' : 'none'}
      stroke={filled ? '#f59e0b' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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
