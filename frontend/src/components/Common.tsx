import { ArrowRight, ArrowUpRight, Compass, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Destination } from '../api'

export function Brand() {
  return <Link className="brand" to="/" aria-label="AITrip home"><Compass aria-hidden="true" size={28} strokeWidth={1.8}/><span>AI<span className="brand-tail">Trip</span></span></Link>
}

export function SearchAtlas({ value = '' }: { value?: string }) {
  const [query, setQuery] = useState(value)
  const navigate = useNavigate()
  return <form role="search" className="atlas-search" onSubmit={event => {
    event.preventDefault()
    navigate('/explore' + (query.trim() ? '?q=' + encodeURIComponent(query.trim()) : ''))
  }}>
    <Search size={19} aria-hidden="true"/>
    <input aria-label="Search destinations" type="search" placeholder="Search destinations" value={query} maxLength={100} onChange={e => setQuery(e.target.value)} />
    <button aria-label="Search the atlas" type="submit"><ArrowRight size={19}/></button>
  </form>
}

export function Feedback({ text, retry }: { text: string; retry?: () => void }) {
  return <div className="feedback" role="status"><p>{text}</p>{retry && <button className="text-link" onClick={retry}>Try again <ArrowRight size={15}/></button>}</div>
}

export function coordinates(destination: Destination) {
  const { latitude: lat, longitude: lon } = destination
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'} / ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`
}

export function DestinationCard({ place }: { place: Destination }) {
  return <Link className="destination-card" to={`/explore/${encodeURIComponent(place.slug)}`}>
    <img src={`/images/${place.slug}.webp`} alt="" loading="lazy" width="560" height="400"/>
    <span className="card-overlay"/>
    <div className="card-content"><span className="mono card-country">{place.country}</span><h3>{place.name}</h3></div>
    <span className="card-action"><ArrowUpRight size={18}/></span>
  </Link>
}
