import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'

// Pages
import { SpeciesPage } from './pages/species'
import { ProtectedAreasPage } from './pages/protected-areas'
import { NewsPage } from './pages/news'
import { GalleryPage } from './pages/gallery'
import { UsersPage } from './pages/users'
import { UnauthorizedPage } from './pages/unauthorized'

// Components
import { Layout } from './components/Layout'
import { LoadingScreen } from './components/LoadingScreen'
import { ThemeProvider } from './components/theme-provider'
import { PermissionGuard } from './components/PermissionGuard'
import { AuthProvider } from './contexts/AuthContext'
import { AuthErrorHandler } from './components/AuthErrorHandler'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Redirect to web project's sign-in page
      window.location.href = import.meta.env.VITE_WEB_URL + '/sign-in'
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return <LoadingScreen />
  }

  if (!isSignedIn) {
    return null
  }

  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="wildtrip-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <AuthErrorHandler>
              <ProtectedRoute>
                <PermissionGuard>
                  <Routes>
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route path="/*" element={
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/species" replace />} />
                        <Route path="/species/*" element={<SpeciesPage />} />
                        <Route path="/protected-areas/*" element={<ProtectedAreasPage />} />
                        <Route path="/news/*" element={<NewsPage />} />
                        <Route path="/gallery/*" element={<GalleryPage />} />
                        <Route path="/users/*" element={<UsersPage />} />
                      </Routes>
                    </Layout>
                  } />
                </Routes>
                </PermissionGuard>
              </ProtectedRoute>
            </AuthErrorHandler>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}