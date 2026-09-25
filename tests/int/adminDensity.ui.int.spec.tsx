import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payloadcms/ui', async () => {
  const ReactModule = await import('react')

  return {
    Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
      ReactModule.createElement('button', props, children),
    PopupList: {
      RadioGroup: ({ children }: { children: React.ReactNode }) =>
        ReactModule.createElement('div', { role: 'radiogroup' }, children),
      RadioGroupItem: ({
        active,
        children,
        onClick,
      }: {
        active?: boolean
        children: React.ReactNode
        onClick?: () => void
      }) =>
        ReactModule.createElement(
          'button',
          {
            'aria-pressed': active,
            onClick,
          },
          children,
        ),
    },
  }
})

import { DensityMenuSetting } from '@/components/AdminDensityControl'

describe('Admin density preference', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.dataset.adminTheme = 'stock'
    delete document.documentElement.dataset.density
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    delete document.documentElement.dataset.adminTheme
    delete document.documentElement.dataset.density
  })

  it('sets Comfortable explicitly when no preference has been stored', async () => {
    render(<DensityMenuSetting />)

    await waitFor(() => expect(document.documentElement.dataset.density).toBe('comfortable'))
  })

  it('applies Compact while the Stock Admin theme is selected', async () => {
    render(<DensityMenuSetting />)

    fireEvent.click(screen.getByRole('button', { name: 'Compact' }))

    await waitFor(() => expect(document.documentElement.dataset.density).toBe('compact'))
    expect(document.documentElement.dataset.adminTheme).toBe('stock')
    expect(window.localStorage.getItem('payload-demo-density')).toBe('compact')
  })
})
