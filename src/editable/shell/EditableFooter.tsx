'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  const browseLinks: Array<[string, string]> = [
    ['Home', '/'],
    ['About', '/about'],
    ['Contact', '/contact'],
    ['Search', '/search'],
  ]
  const accountLinks: Array<[string, string]> = session
    ? []
    : [['Sign in', '/login'], ['Sign up', '/signup']]

  return (
    <footer className="border-t border-[var(--editable-border)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-full w-full scale-125 object-cover" />
            </span>
            <span className="editable-display text-2xl font-semibold tracking-tight lowercase">{SITE_CONFIG.name}</span>
          </Link>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-page-text)]">Browse</h3>
          <div className="mt-5 grid gap-2.5">
            {browseLinks.map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]">
                {label} <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-page-text)]">Account</h3>
          <div className="mt-5 grid gap-2.5">
            {accountLinks.map(([label, href]) => (
              <Link key={href} href={href} className="text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]">
                {label}
              </Link>
            ))}
            {session ? (
              <button
                type="button"
                onClick={logout}
                className="text-left text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--editable-border)]">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col items-center justify-between gap-2 px-4 py-6 text-xs font-medium text-[var(--slot4-muted-text)] sm:flex-row sm:px-6 lg:px-8">
          <span>© {year} {SITE_CONFIG.name}. All rights reserved.</span>
          <span className="flex items-center gap-4">
            <Link href="/about" className="hover:text-[var(--slot4-accent)]">Privacy</Link>
            <Link href="/about" className="hover:text-[var(--slot4-accent)]">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--slot4-accent)]">Support</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
