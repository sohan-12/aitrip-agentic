import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, expect, it } from 'vitest'
import { SearchAtlas } from '../../src/components/Common'

function ResultsLocation() {
  const location = useLocation()
  return <output>{location.pathname}{location.search}</output>
}

afterEach(cleanup)

it.each([
  ['  Alps & lakes  ', '/explore?q=Alps%20%26%20lakes'],
  ['  ', '/explore'],
])('routes the search term %j to the atlas', (query, expected) => {
  render(<MemoryRouter><Routes>
    <Route path="/" element={<SearchAtlas />} />
    <Route path="/explore" element={<ResultsLocation />} />
  </Routes></MemoryRouter>)

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search destinations' }), {
    target: { value: query },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Search the atlas' }))
  expect(screen.getByRole('status')).toHaveTextContent(expected)
})
