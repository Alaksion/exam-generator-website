import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { MenuIcon, XIcon } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export function UiShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { signOut, user } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'admin'
  const headerRef = useRef<HTMLElement>(null)

  const closeMenu = () => setMenuOpen(false)

  // Close the mobile menu on Escape, on a tap outside the header, and whenever
  // the route changes (e.g. after activating one of its links).
  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  useEffect(() => {
    closeMenu()
  }, [location.pathname, location.search])

  const desktopLinkClass =
    'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground'
  const mobileLinkClass =
    'block rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground'

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <header ref={headerRef} className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="font-heading text-lg font-medium">
            Mock Exams
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation">
            <Link
              to="/"
              aria-current={location.pathname === '/' ? 'page' : undefined}
              className={desktopLinkClass}
            >
              Catalog
            </Link>
            <Link
              to="/history"
              aria-current={location.pathname.startsWith('/history') ? 'page' : undefined}
              className={desktopLinkClass}
            >
              History
            </Link>
            {isAdmin && (
              <Link
                to="/manage/certifications"
                aria-current={location.pathname.startsWith('/manage') ? 'page' : undefined}
                className={desktopLinkClass}
              >
                Certifications
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="ml-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Sign out
            </button>
          </nav>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <XIcon aria-hidden="true" className="size-4" />
            ) : (
              <MenuIcon aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="border-t px-4 py-2 md:hidden"
            aria-label="Mobile navigation"
          >
            <Link
              to="/"
              onClick={closeMenu}
              aria-current={location.pathname === '/' ? 'page' : undefined}
              className={mobileLinkClass}
            >
              Catalog
            </Link>
            <Link
              to="/history"
              onClick={closeMenu}
              aria-current={location.pathname.startsWith('/history') ? 'page' : undefined}
              className={mobileLinkClass}
            >
              History
            </Link>
            {isAdmin && (
              <Link
                to="/manage/certifications"
                onClick={closeMenu}
                aria-current={location.pathname.startsWith('/manage') ? 'page' : undefined}
                className={mobileLinkClass}
              >
                Certifications
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                closeMenu()
                signOut()
              }}
              className="block w-full rounded-md px-2 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Sign out
            </button>
          </nav>
        )}
      </header>
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
