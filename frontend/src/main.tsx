import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@fontsource-variable/plus-jakarta-sans/index.css'
import '@fontsource/oswald/latin-600.css'
import App from './App'

class ErrorBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) {
      return <main><h1>The page could not load</h1><button onClick={() => window.location.reload()}>Reload page</button></main>
    }
    return this.props.children
  }
}

const queryClient = new QueryClient({defaultOptions: {queries: {retry: 1, staleTime: 60_000}}})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter><App /></BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
