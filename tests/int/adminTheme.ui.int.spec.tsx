import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const uiMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('@payloadcms/ui', async () => {
  const ReactModule = await import('react')

  return {
    PopupList: {
      RadioGroup: ({ children }: { children: React.ReactNode }) =>
        ReactModule.createElement('div', { role: 'radiogroup' }, children),
      RadioGroupItem: ({
        active,
        children,
        disabled,
        onClick,
      }: {
        active?: boolean
        children: React.ReactNode
        disabled?: boolean
        onClick?: () => void
      }) =>
        ReactModule.createElement(
          'button',
          {
            'aria-pressed': active,
            disabled,
            onClick,
          },
          children,
        ),
    },
    useAuth: uiMocks.useAuth,
  }
})

import { adminThemeConfig } from '@/adminThemes'
import { AdminThemeMenuSetting, AdminThemeProvider } from '@/components/AdminThemeControl'

describe('Admin theme preference', () => {
  beforeEach(() => {
    uiMocks.useAuth.mockReturnValue({ user: { id: 'editor-1', role: 'content-editor' } })
    adminThemeConfig.enforcement = null
    window.localStorage.clear()
    delete document.documentElement.dataset.adminTheme
    delete document.documentElement.dataset.brandTheme
  })

  afterEach(() => {
    cleanup()
    adminThemeConfig.enforcement = null
    window.localStorage.clear()
    delete document.documentElement.dataset.adminTheme
    delete document.documentElement.dataset.brandTheme
  })

  it('applies the configured default independently from the website theme', () => {
    document.documentElement.dataset.brandTheme = 'payload'

    render(<AdminThemeProvider />)

    expect(document.documentElement.dataset.adminTheme).toBe('light-cream')
    expect(document.documentElement.dataset.brandTheme).toBe('payload')
  })

  it('stores the selected Admin theme for the current user', async () => {
    render(
      <AdminThemeProvider>
        <AdminThemeMenuSetting />
      </AdminThemeProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Stock' }))

    await waitFor(() => expect(document.documentElement.dataset.adminTheme).toBe('stock'))
    expect(window.localStorage.getItem('payload-demo-admin-theme:editor-1')).toBe('stock')
  })

  it('keeps preferences separate for different users in the same browser', async () => {
    window.localStorage.setItem('payload-demo-admin-theme:editor-1', 'stock')
    window.localStorage.setItem('payload-demo-admin-theme:admin-1', 'light-cream')

    const { unmount } = render(<AdminThemeProvider />)
    await waitFor(() => expect(document.documentElement.dataset.adminTheme).toBe('stock'))
    unmount()

    uiMocks.useAuth.mockReturnValue({ user: { id: 'admin-1', role: 'site-admin' } })
    render(<AdminThemeProvider />)

    await waitFor(() => expect(document.documentElement.dataset.adminTheme).toBe('light-cream'))
  })

  it('can enforce an Admin theme for selected roles', () => {
    adminThemeConfig.enforcement = {
      roles: ['content-editor'],
      theme: 'light-cream',
    }
    window.localStorage.setItem('payload-demo-admin-theme:editor-1', 'stock')

    render(
      <AdminThemeProvider>
        <AdminThemeMenuSetting />
      </AdminThemeProvider>,
    )

    expect(document.documentElement.dataset.adminTheme).toBe('light-cream')
    expect(screen.getByRole('button', { name: 'Stock' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Light Cream' }).hasAttribute('disabled')).toBe(true)
  })
})
