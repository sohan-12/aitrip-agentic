import { lazy, Suspense, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Crosshair, Globe2, MapPin } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useDestinations } from '../api'
import { coordinates, DestinationCard, Feedback, SearchAtlas } from '../components/Common'

const Earth = lazy(() => import('../components/Earth'))

export function Home() {
  const places = useDestinations()
  const [focusSlug, setFocusSlug] = useState<string>()
  const focus = places.data?.find(place => place.slug === focusSlug)
  const placesBySlug = new Map(places.data?.map(place => [place.slug, place]))
  const featured = ['dolomites', 'kyoto', 'ooty'].flatMap(slug => placesBySlug.get(slug) ?? [])
  return <>
    <section className="hero">
      <div className="star-field" aria-hidden="true"/>
      <div className="hero-inner shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="cyan-rule"/> Interactive world atlas</p>
          <h1>Where to <em>next?</em></h1>
          <p className="hero-intro">Explore the globe, find a destination, and start a travel brief around the way you like to travel.</p>
          <SearchAtlas/>
          {places.data && <div className="fly-to"><span><Crosshair size={13}/> Fly to</span>
            {['ooty', 'kyoto', 'dolomites'].map(slug => {
              const place = placesBySlug.get(slug)
              return place && <button key={slug} aria-pressed={focusSlug === slug} onClick={() => setFocusSlug(slug)}>{place.name}</button>
            })}
          </div>}
          {focus && <div aria-live="polite" className="focus-readout"><MapPin size={13}/><span>{coordinates(focus)}</span><Link to={`/explore/${focus.slug}`}>View {focus.name} <ArrowUpRight size={13}/></Link></div>}
        </div>
        <div className="globe-stage"><Suspense fallback={<div className="globe-loading" role="status">Loading globe…</div>}><Earth target={focus ?? null}/></Suspense></div>
      </div>
      <div className="hero-foot shell"><a href="#field-guide"><ArrowDown size={14}/> Discover destinations</a></div>
    </section>
    <section className="featured shell" id="field-guide">
      <div className="section-head"><div><p className="eyebrow"><span className="cyan-rule"/> Destination field guide</p><h2>Featured destinations</h2></div>
        <Link to="/explore" className="text-link">View all <ArrowRight size={16}/></Link></div>
      {places.isPending ? <Feedback text="Loading destination guides…"/> : places.isError ? <Feedback text="The destination atlas could not be loaded." retry={() => places.refetch()}/> : featured.length ? <div className="cards">{featured.map(place => <DestinationCard key={place.slug} place={place}/>)}</div> : <Feedback text="No destination guides are available yet."/>}
    </section>
  </>
}

export function Explore() {
  const [search] = useSearchParams()
  const q = search.get('q')?.trim() ?? ''
  const places = useDestinations(q)
  return <section className="page shell">
    <p className="eyebrow"><Globe2 size={15}/> Travel atlas</p>
    <h1>Explore destinations</h1>
    <p className="intro">Find a destination guide and use it as the starting point for your trip.</p>
    <SearchAtlas key={q} value={q}/>
    <div className="atlas-results" aria-live="polite">
      {places.isPending ? <Feedback text="Searching the atlas…"/> : places.isError ? <Feedback text="The destination atlas could not be loaded." retry={() => places.refetch()}/> : places.data.length ? <>
        <p className="results-count">{places.data.length} {places.data.length === 1 ? 'destination' : 'destinations'}{q && <> matching “{q}”</>}</p>
        <div className="cards explore-cards">{places.data.map(place => <DestinationCard key={place.slug} place={place}/>)}</div>
      </> : <div className="feedback"><h2>No matching destinations.</h2><p>Try a country or another destination name.</p><Link className="text-link" to="/explore">Show all destinations <ArrowRight size={16}/></Link></div>}
    </div>
  </section>
}

export function Place() {
  const { slug } = useParams()
  const places = useDestinations()
  const place = places.data?.find(candidate => candidate.slug === slug)
  return <section className="page shell">
    <Link className="back" to="/explore"><ArrowLeft size={15}/> Explore destinations</Link>
    {places.isPending ? <Feedback text="Loading destination guide…"/> : places.isError ? <Feedback text="The destination guide could not be loaded." retry={() => places.refetch()}/> : !place ? <Feedback text="Destination guide not found."/> :
      <div className="detail">
        <img className="detail-photo" src={`/images/${place.slug}.webp`} alt={place.name}/>
        <div className="detail-copy">
          <p className="eyebrow"><MapPin size={15}/>{place.region} · {place.country}</p><h1>{place.name}</h1>
          <p className="intro">{place.description}</p>
          <p className="coords mono"><Crosshair size={15}/>{coordinates(place)}</p>
          <a className="source-link" href={place.source_url} target="_blank" rel="noreferrer"><BookOpen size={15}/> Destination reference <ArrowUpRight size={14}/></a>
          <Link className="solid-button" to={`/planner?destination=${encodeURIComponent(place.slug)}`}>Plan this trip <ArrowRight size={16}/></Link>
        </div>
      </div>}
  </section>
}
