import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { ThemeToggle } from './theme-toggle'
import { ArrowLeft, Menu } from 'lucide-react'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from './ui/sheet'
import { 
  canManageSpecies, 
  canManageAreas, 
  canManageNews, 
  canManageGallery, 
  canManageUsers,
  type Role 
} from '@/lib/utils/permissions'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user } = useUser()
  const userRole = (user?.publicMetadata?.role as Role) || 'user'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const allNavItems = [
    { path: '/species', label: 'Especies', permission: canManageSpecies },
    { path: '/protected-areas', label: 'Áreas Protegidas', permission: canManageAreas },
    { path: '/news', label: 'Noticias', permission: canManageNews },
    { path: '/gallery', label: 'Galería', permission: canManageGallery },
    { path: '/users', label: 'Usuarios', permission: canManageUsers },
  ]
  
  // Filter nav items based on user permissions
  const navItems = allNavItems.filter(item => item.permission(userRole))

  const logo = import.meta.env.VITE_R2_PUBLIC_URL + '/colored_logo_v2.svg'

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Wildtrip Admin</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">un servicio de</span>
                  <img src={logo} alt="Wildtrip" className="h-3 sm:h-4 w-auto" />
                </div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden xl:inline-flex"
              >
                <a 
                  href={import.meta.env.VITE_WEB_URL || 'http://localhost:4321'} 
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al sitio</span>
                </a>
              </Button>
              <ThemeToggle />
              <UserButton afterSignOutUrl={import.meta.env.VITE_WEB_URL} />
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <UserButton afterSignOutUrl={import.meta.env.VITE_WEB_URL} />
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Wildtrip Admin</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">un servicio de</span>
                        <img src={logo} alt="Wildtrip" className="h-4 w-auto" />
                      </div>
                    </div>
                  </SheetHeader>
                  <nav className="mt-6 space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                          location.pathname.startsWith(item.path)
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4">
                      <a 
                        href={import.meta.env.VITE_WEB_URL || 'http://localhost:4321'} 
                        className="block px-4 py-3 rounded-md text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          <span>Volver al sitio</span>
                        </div>
                      </a>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
        {location.pathname === '/gallery' || 
         location.pathname === '/species' || 
         location.pathname === '/protected-areas' || 
         location.pathname === '/news' || 
         location.pathname === '/users' ||
         location.pathname.includes('/edit') ? (
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}