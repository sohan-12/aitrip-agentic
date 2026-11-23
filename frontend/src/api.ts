import { useQuery } from '@tanstack/react-query'

export interface Destination {
  slug: string
  name: string
  country: string
  region: string
  description: string
  latitude: number
  longitude: number
  source_url: string
  provenance: 'reference'
}

export interface Brief {
  id: string
  prompt: string
  destination_slug: string | null
  created_at: string
}

const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(12000), ...init })
  if (!response.ok) throw new Error(`Request failed (${response.status})`)
  return response.json()
}

export function useDestinations(query = '') {
  return useQuery({
    queryKey: ['destinations', query],
    queryFn: () => request<Destination[]>(`/api/destinations?q=${encodeURIComponent(query)}`),
    staleTime: 60_000,
    retry: 1,
  })
}

export function saveBrief(prompt: string, destination_slug: string | null) {
  return request<Brief & {token: string}>('/api/briefs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, destination_slug }),
  })
}

export function loadBrief(id: string, token: string) {
  return request<Brief>(`/api/briefs/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
}
