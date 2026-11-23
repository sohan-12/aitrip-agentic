import { Component, useEffect, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Brand } from './components/Common'
import { Home, Explore, Place } from './pages/Atlas'
import { Planner, SavedBrief } from './pages/Planner'
import './styles.css'

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <div className="page narrow"><h1>Something went wrong</h1><p>Reload this page to try again.</p><button className="solid-button" onClick={() => window.location.reload()}>Reload page</button></div> : this.props.children
  }
}

export default function App() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const page = location.pathname.startsWith('/planner') ? 'Trip planner' : location.pathname.startsWith('/explore') ? 'Explore destinations' : 'Travel atlas'
    document.title = `${page} · AITrip`
  }, [location.pathname, location.search])
  return <div className="app">
    <a className="skip" href="#main">Skip to content</a>
    <header className="site-header"><div className="nav-inner">
      <Brand/>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" end>Discover</NavLink>
        <NavLink to="/explore">Explore</NavLink>
        <NavLink to="/planner">Trip planner</NavLink>
      </nav>
      <Link to="/planner" className="nav-cta">Plan a trip <ArrowUpRight size={15}/></Link>
    </div></header>
    <main id="main" tabIndex={-1}>
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/explore" element={<Explore/>}/>
          <Route path="/explore/:slug" element={<Place/>}/>
          <Route path="/planner" element={<Planner/>}/>
          <Route path="/planner/briefs/:id" element={<SavedBrief/>}/>
          <Route path="*" element={<div className="page narrow"><h1>Page not found</h1><Link className="text-link" to="/">Back to Discover</Link></div>}/>
        </Routes>
      </ErrorBoundary>
    </main>
    <footer className="footer shell"><Brand/><div><Link to="/explore">Destination atlas</Link><Link to="/planner">Trip planner</Link></div></footer>
  </div>
}
