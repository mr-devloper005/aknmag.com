'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, PlusCircle, LogOut } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const displayLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Search', href: '/search' },
  ]
  const firstChar = (session?.name || session?.email || 'U').trim().charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-50 bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur-md">
      <nav className="mx-auto flex min-h-[84px] w-full max-w-[var(--editable-container)] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition group-hover:border-[var(--slot4-accent)] group-hover:shadow-[0_6px_18px_rgba(74,92,255,0.22)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-full w-full scale-125 object-cover" />
          </span>
          <span className="hidden min-w-0 leading-none sm:block">
            <span className="editable-display block max-w-[200px] truncate text-xl font-semibold tracking-tight lowercase">{SITE_CONFIG.name}</span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {displayLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-[0.14em] transition ${
                  active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-3">
          {session ? (
            <>
              <span
                className="hidden items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] py-2 pl-2 pr-4 text-sm font-semibold text-[var(--slot4-page-text)] sm:inline-flex"
                title={session.email}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-xs font-bold text-white">{firstChar}</span>
                <span className="max-w-[130px] truncate">{session.name || session.email}</span>
              </span>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-full bg-[var(--editable-cta-bg)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--editable-cta-text)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(74,92,255,0.35)] sm:inline-flex"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Create
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-2 rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] sm:inline-flex"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)] sm:inline-flex"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full bg-[var(--editable-cta-bg)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--editable-cta-text)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(74,92,255,0.35)] sm:inline-flex"
              >
                Login
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] sm:inline-flex"
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {searchOpen ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-5 sm:px-6 lg:px-8">
          <form action="/search" className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3 shadow-[0_10px_30px_rgba(15,18,34,0.06)]">
            <Search className="h-4 w-4 text-[var(--slot4-accent)]" />
            <input name="q" autoFocus type="search" placeholder="Search articles, businesses, topics…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]" />
            <button className="rounded-full bg-[var(--slot4-accent)] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:brightness-105">Search</button>
          </form>
        </div>
      ) : null}

      <div className="h-px bg-[var(--editable-border)]" />

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-4 py-5 lg:hidden">
          <form action="/search" className="mb-5 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2.5">
            <Search className="h-4 w-4 text-[var(--slot4-accent)]" />
            <input name="q" type="search" placeholder="Search…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]" />
          </form>
          {session ? (
            <div className="mb-3 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-3 py-2 text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-xs font-bold text-white">{firstChar}</span>
              <span className="min-w-0 truncate font-semibold text-[var(--slot4-page-text)]">{session.name || session.email}</span>
            </div>
          ) : null}
          <div className="grid gap-1">
            {[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'Search', href: '/search' },
              ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Sign up', href: '/signup' }]),
            ].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-full px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] ${
                    active
                      ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                      : 'text-[var(--slot4-page-text)] hover:bg-[var(--slot4-panel-bg)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <button
                type="button"
                onClick={() => { logout(); setOpen(false) }}
                className="mt-1 rounded-full px-4 py-3 text-left text-sm font-bold uppercase tracking-[0.16em] text-[var(--slot4-page-text)] hover:bg-[var(--slot4-panel-bg)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
