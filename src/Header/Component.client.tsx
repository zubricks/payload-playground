'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { MenuIcon, SearchIcon, XIcon } from 'lucide-react'

import type { Header } from '@/payload-types'
import type { BrandTheme } from '@/brandThemes'

import { Logo } from '@/components/Logo/Logo'
import { NorthstarWordmark } from '@/components/NorthstarWordmark'
import { HeaderNav } from './Nav'
import { HeaderNavItem } from './NavItem'

interface HeaderClientProps {
  brandTheme: BrandTheme
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ brandTheme, data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
    setMenuOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  if (brandTheme === 'northstar') {
    const navItems = data?.navItems || []

    return (
      <header
        className="northstar-header container z-30"
        data-over-hero={pathname === '/' ? 'true' : undefined}
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="northstar-header__shell">
          <Link aria-label="Northstar home" className="northstar-header__brand" href="/">
            <NorthstarWordmark />
          </Link>

          <nav aria-label="Primary navigation" className="northstar-header__nav">
            {navItems.map((item, index) => (
              <HeaderNavItem
                className={
                  item.kind !== 'dropdown' && index === navItems.length - 1
                    ? 'northstar-header__cta'
                    : undefined
                }
                item={item}
                key={index}
              />
            ))}
            <Link aria-label="Search" className="northstar-header__search" href="/search">
              <SearchIcon />
            </Link>
          </nav>

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="northstar-header__menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {menuOpen ? (
          <div className="northstar-header__mobile-panel">
            <nav aria-label="Mobile navigation">
              {navItems.map((item, index) => (
                <HeaderNavItem item={item} key={index} mobile />
              ))}
              <Link href="/search">Search</Link>
            </nav>
            <span>Thoughtful digital experiences, built to last.</span>
          </div>
        ) : null}
      </header>
    )
  }

  return (
    <header className="container sticky top-0 z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between">
        <Link href="/">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
