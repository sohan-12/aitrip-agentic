import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, BookOpen, Check, FileText, MapPin, NotebookPen } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { loadBrief, saveBrief, useDestinations } from '../api'
import { Feedback } from '../components/Common'

const example = 'Plan a four-day nature trip from Hyderabad to Ooty for two people under ₹15,000. We prefer trains, vegetarian meals, and budget stays.'
const sessionKey = 'aitrip.brief-access.v1'
type Access = { id: string; token: string }
let memoryAccess: Access[] = []

function readAccess(): Access[] {
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(sessionKey) || '[]')
    if (Array.isArray(data)) {
      const stored = data.filter((item): item is Access => typeof item?.id === 'string' && typeof item?.token === 'string')
      return [...stored.filter(item => !memoryAccess.some(other => item.id === other.id)), ...memoryAccess]
    }
  } catch { /* The in-memory fallback still supports reopening in this view. */ }
  return memoryAccess
}

function remember(access: Access) {
  const entries = [...readAccess().filter(entry => entry.id !== access.id), access]
  memoryAccess = entries
  try { sessionStorage.setItem(sessionKey, JSON.stringify(entries)); return true }
  catch { return false }
}

export function Planner() {
  const [params] = useSearchParams()
  const [prompt, setPrompt] = useState('')
  const [destination, setDestination] = useState(params.get('destination') ?? '')
  const places = useDestinations()
  const navigate = useNavigate()
  const [invalid, setInvalid] = useState(false)
  const latest = readAccess().at(-1)
  const mutation = useMutation({
    mutationFn: () => saveBrief(prompt.trim(), destination || null),
    onSuccess: brief => {
      const stored = remember({ id: brief.id, token: brief.token })
      navigate(`/planner/briefs/${brief.id}`, { state: { temporary: !stored } })
    },
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!prompt.trim()) { setInvalid(true); return }
    mutation.mutate()
  }
  return <section className="page shell planner-page">
    <p className="eyebrow"><NotebookPen size={15}/> Trip planner</p><h1>Start with your trip.</h1>
    <p className="intro">Tell us where you want to go, who’s coming, and what matters to you. Save your brief to revisit it in this tab.</p>
    <div className="planner-layout"><form className="panel planner-form" onSubmit={submit}>
      <label htmlFor="trip-prompt">Your trip brief</label>
      <textarea id="trip-prompt" rows={6} maxLength={4000} required aria-invalid={invalid} aria-describedby={invalid ? 'prompt-error' : undefined} value={prompt} onChange={event => { setPrompt(event.target.value); setInvalid(false) }} placeholder="I'd like to spend four days exploring the hills of Ooty…"/>
      {invalid && <p className="field-error" role="alert" id="prompt-error">Enter your trip details.</p>}
      <div className="form-under"><button className="text-link" type="button" onClick={() => { setPrompt(example); setInvalid(false) }}>Use an example</button><span>{prompt.length}/4000</span></div>
      <label htmlFor="destination">Destination guide <span>(optional)</span></label>
      <select id="destination" value={destination} onChange={event => setDestination(event.target.value)}>
        <option value="">Choose a destination</option>{places.data?.map(place => <option key={place.slug} value={place.slug}>{place.name}, {place.country}</option>)}
      </select>
      {places.isError && <Feedback text="Destination guides could not be loaded." retry={() => places.refetch()}/>}
      {mutation.isError && <p className="field-error" role="alert">Couldn’t save your brief. Check the connection and try again.</p>}
      <button className="solid-button" disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Saving…' : 'Save trip brief'} <ArrowRight size={16}/></button>
    </form>
    <aside className="planner-aside">
      <FileText size={25}/><h2>What to include</h2>
      <ul><li>Your starting point and destination</li><li>Travel dates and number of people</li><li>Total budget and preferred transport</li><li>Food, accessibility, and interests</li></ul>
      {latest && <Link className="text-link" to={`/planner/briefs/${latest.id}`}>Reopen last brief <ArrowRight size={15}/></Link>}
    </aside></div>
  </section>
}

export function SavedBrief() {
  const { id = '' } = useParams()
  const token = readAccess().find(entry => entry.id === id)?.token
  const places = useDestinations()
  const brief = useQuery({ queryKey: ['brief', id], enabled: Boolean(token), queryFn: () => loadBrief(id, token!), retry: 1 })
  let stored = false
  try { stored = JSON.parse(sessionStorage.getItem(sessionKey) || '[]').some((entry: Access) => entry.id === id) } catch { /* Show session warning. */ }
  const place = places.data?.find(place => place.slug === brief.data?.destination_slug)
  return <section className="page shell narrow">
    <Link className="back" to="/planner"><ArrowLeft size={15}/> Trip planner</Link>
    {!token ? <Feedback text="This brief can only be opened in the tab where it was saved."/> : brief.isPending ? <Feedback text="Opening your trip brief…"/> : brief.isError ? <Feedback text="Couldn’t reopen this brief." retry={() => brief.refetch()}/> : <article className="panel saved-panel">
      <p className="eyebrow"><Check size={16}/> Saved to your atlas</p><h1>Your saved brief</h1>
      <p className="brief-prompt">{brief.data.prompt}</p>
      {place && <Link className="source-link" to={`/explore/${place.slug}`}><MapPin size={15}/>{place.name}, {place.country}<ArrowRight size={15}/></Link>}
      <p className="save-note"><BookOpen size={17}/>{stored ? 'You can reopen this brief from the trip planner in this tab.' : 'Browser storage is unavailable. Reloading or closing this tab will lose access to this brief.'}</p>
      <Link className="text-link" to="/planner">Start another brief <ArrowRight size={15}/></Link>
    </article>}
  </section>
}
