import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { NorthstarWordmark } from '@/components/NorthstarWordmark'
import type { BrandTheme } from '@/brandThemes'

export async function Footer({ brandTheme }: { brandTheme: BrandTheme }) {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  if (brandTheme === 'northstar') {
    return (
      <footer className="northstar-footer site-footer mt-auto">
        <div className="container northstar-footer__inner">
          <div className="northstar-footer__cta-row">
            <div>
              <span className="northstar-kicker">Start a conversation</span>
              <h2>Have something worth building?</h2>
            </div>
            <CMSLink
              appearance="outline"
              className="northstar-footer__contact"
              label="Let’s work together"
              type="custom"
              url="/contact"
            />
          </div>

          <div className="northstar-footer__links-row">
            <div className="northstar-footer__intro">
              <NorthstarWordmark />
              <p>A considered foundation for content-rich websites, products, and ideas.</p>
            </div>
            <nav aria-label="Footer navigation" className="northstar-footer__nav">
              <span>Explore</span>
              {navItems.map(({ link }, index) => (
                <CMSLink key={index} {...link} />
              ))}
            </nav>
            <div className="northstar-footer__meta">
              <span>Elsewhere</span>
              <a href="https://payloadcms.com" rel="noreferrer" target="_blank">
                Payload
              </a>
              <a href="https://github.com/payloadcms/payload" rel="noreferrer" target="_blank">
                GitHub
              </a>
            </div>
          </div>

          <div className="northstar-footer__word">Northstar</div>

          <div className="northstar-footer__bottom">
            <span>© {new Date().getFullYear()} Northstar Studio</span>
            <span>Built with Payload</span>
            <ThemeSelector />
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="site-footer mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
