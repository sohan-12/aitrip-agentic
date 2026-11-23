import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react'
import './earth.css'

const EarthScene = lazy(() => import('./EarthScene'))

export type EarthTarget = { latitude: number; longitude: number; name?: string }
type Props = { target?: EarthTarget | null; className?: string }

const initialView = { latitude: 20, longitude: 47, zoom: 1 }
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

export default function Earth({ target, className = '' }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null)
  const [view, setView] = useState(initialView)
  const [ready, setReady] = useState(false)
  const [supported, setSupported] = useState(false)
  const [failed, setFailed] = useState(false)
  const [visible, setVisible] = useState(false)
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [spinning, setSpinning] = useState(true)
  const [autoOffset, setAutoOffset] = useState(0)
  const spinOffset = useRef(0)
  const latitude = target?.latitude
  const longitude = target?.longitude

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setMotion(!mq.matches)
    mq.addEventListener('change', update)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    if (host.current) observer.observe(host.current)
    return () => { observer.disconnect(); mq.removeEventListener('change', update) }
  }, [])

  useEffect(() => {
    if (!visible || supported || failed) return
    try {
      const probe = document.createElement('canvas').getContext('webgl2')
      if (!probe) { setFailed(true); return }
      probe.getExtension('WEBGL_lose_context')?.loseContext()
      setSupported(true)
    } catch {
      setFailed(true)
    }
  }, [visible, supported, failed])

  useEffect(() => {
    spinOffset.current = 0
    setAutoOffset(0)
    setView(latitude === undefined || longitude === undefined
      ? initialView : { latitude, longitude, zoom: 1.08 })
    setSpinning(latitude === undefined)
  }, [latitude, longitude])

  function stopSpin() {
    setSpinning(false)
    setAutoOffset(spinOffset.current)
  }

  function rotate(dx: number, dy: number) {
    stopSpin()
    setView(previous => ({
      ...previous,
      longitude: previous.longitude + dx,
      latitude: clamp(previous.latitude + dy, -85, 85),
    }))
  }

  function zoom(step: number) {
    setView(previous => ({ ...previous, zoom: clamp(previous.zoom + step, 0.75, 1.4) }))
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    switch (event.key) {
      case 'ArrowLeft': rotate(-8, 0); break
      case 'ArrowRight': rotate(8, 0); break
      case 'ArrowUp': rotate(0, 8); break
      case 'ArrowDown': rotate(0, -8); break
      case '+': case '=': zoom(0.1); break
      case '-': zoom(-0.1); break
      default: return
    }
    event.preventDefault()
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current
    if (!start || start.id !== event.pointerId) return
    rotate((start.x - event.clientX) * .28, (event.clientY - start.y) * .28)
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
  }

  const interactive = ready && !failed
  return (
    <div className={`earth ${className}`} ref={host}>
      <div className="earth-stars" aria-hidden="true" />
      <div className="earth-stage" role="group" aria-label="Interactive Earth" tabIndex={interactive ? 0 : undefined}
        aria-description="Drag or use the arrow keys to rotate. Use plus and minus to zoom."
        onKeyDown={keyDown}
        onPointerDown={event => {
          if (!interactive || event.button !== 0) return
          pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={drag} onPointerUp={() => { pointer.current = null }}
        onLostPointerCapture={() => { pointer.current = null }}>
        <img className={`earth-poster ${interactive ? 'earth-poster-hidden' : ''}`}
          src="/earth/earth-poster.webp" alt={interactive ? '' : 'Satellite view of Earth showing Africa, the Indian Ocean and Asia'} />
        {!failed && supported && (
          <SceneBoundary onFailure={() => setFailed(true)}>
            <Suspense fallback={null}>
              <EarthScene view={view} target={target} enabled={visible} motion={motion}
                spin={motion && spinning} autoOffset={autoOffset} spinOffset={spinOffset}
                onReady={() => setReady(true)} onFailure={() => setFailed(true)} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>
      {interactive && (
        <div className="earth-tools" role="group" aria-label="Earth controls">
          {motion && <button type="button" title={spinning ? 'Pause rotation' : 'Resume rotation'}
            aria-label={spinning ? 'Pause rotation' : 'Resume rotation'}
            onClick={() => spinning ? stopSpin() : setSpinning(true)}>{spinning ? <Pause /> : <Play />}</button>}
          <button type="button" title="Reset globe view" aria-label="Reset globe view" onClick={() => {
            spinOffset.current = 0
            setAutoOffset(0)
            setView(latitude === undefined || longitude === undefined ? initialView : { latitude, longitude, zoom: 1.08 })
            setSpinning(latitude === undefined)
          }}><RotateCcw /></button>
          <button type="button" title="Zoom out" aria-label="Zoom out" disabled={view.zoom <= .75} onClick={() => zoom(-.15)}><Minus /></button>
          <button type="button" title="Zoom in" aria-label="Zoom in" disabled={view.zoom >= 1.4} onClick={() => zoom(.15)}><Plus /></button>
        </div>
      )}
    </div>
  )
}
