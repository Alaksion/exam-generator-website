import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function UiShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { clearKey } = useAuth()
  const location = useLocation()

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <a href="/manage/certifications" className="font-heading text-lg font-medium">
            Mock Exams
          </a>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation">
            <a
              href="/"
              aria-current={location.pathname === '/' ? 'page' : undefined}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
            >
              Catalog
            </a>
            <a
              href="/history"
              aria-current={location.pathname.startsWith('/history') ? 'page' : undefined}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
            >
              History
            </a>
            <a
              href="/manage/certifications"
              aria-current={location.pathname.startsWith('/manage') ? 'page' : undefined}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
            >
              Certifications
            </a>
            <button
              type="button"
              onClick={clearKey}
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
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            ☰
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t px-4 py-2 md:hidden" aria-label="Mobile navigation">
            <a
              href="/history"
              onClick={closeMenu}
              className="block rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              History
            </a>
            <a
              href="/manage/certifications"
              onClick={closeMenu}
              className="block rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Certifications
            </a>
            <button
              type="button"
              onClick={() => {
                closeMenu()
                clearKey()
              }}
              className="block w-full rounded-md px-2 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Sign out
            </button>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
