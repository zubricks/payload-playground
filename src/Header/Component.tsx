import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import type { BrandTheme } from '@/brandThemes'

export async function Header({ brandTheme }: { brandTheme: BrandTheme }) {
  const headerData = await getCachedGlobal('header', 1)()

  return <HeaderClient brandTheme={brandTheme} data={headerData} />
}
