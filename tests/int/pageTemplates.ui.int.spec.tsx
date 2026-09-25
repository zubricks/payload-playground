import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const uiMocks = vi.hoisted(() => ({
  formFields: {
    'layout.0.columns': {
      rows: [{ id: 'column-1' }, { id: 'column-2' }],
      value: 2,
    },
    layout: { value: [] as unknown[] },
    pageTemplate: { value: null as null | string },
  },
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  useAuth: vi.fn(),
  useDocumentInfo: vi.fn(),
  useField: vi.fn(),
  useForm: vi.fn(),
  useFormFields: vi.fn(),
}))

vi.mock('@payloadcms/ui', async () => {
  const ReactModule = await import('react')

  return {
    ArrayField: ({ field }: { field: { admin?: { isSortable?: boolean }; maxRows?: number } }) =>
      ReactModule.createElement('div', {
        'data-is-sortable': String(field.admin?.isSortable),
        'data-max-rows': field.maxRows === undefined ? 'unset' : String(field.maxRows),
        'data-testid': 'array-field',
      }),
    BlocksField: ({ field }: { field: { admin?: { isSortable?: boolean }; maxRows?: number } }) =>
      ReactModule.createElement('div', {
        'data-is-sortable': String(field.admin?.isSortable),
        'data-max-rows': field.maxRows === undefined ? 'unset' : String(field.maxRows),
        'data-testid': 'blocks-field',
      }),
    Button: ({
      buttonStyle: _buttonStyle,
      children,
      loading: _loading,
      margin: _margin,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      buttonStyle?: string
      loading?: boolean
      margin?: boolean
    }) => ReactModule.createElement('button', props, children),
    SelectInput: ({
      description,
      label,
      onChange,
      options,
      readOnly,
      value,
    }: {
      description?: string
      label?: string
      onChange?: (option: { label: string; value: string }) => void
      options?: { label: string; value: string }[]
      readOnly?: boolean
      value?: string
    }) =>
      ReactModule.createElement(
        ReactModule.Fragment,
        null,
        ReactModule.createElement(
          'label',
          null,
          label,
          ReactModule.createElement(
            'select',
            {
              disabled: readOnly,
              onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
                const option = options?.find((item) => item.value === event.target.value)
                if (option) onChange?.(option)
              },
              value,
            },
            options?.map((option) =>
              ReactModule.createElement(
                'option',
                { key: option.value, value: option.value },
                option.label,
              ),
            ),
          ),
        ),
        description ? ReactModule.createElement('p', null, description) : null,
      ),
    SelectField: ({ readOnly }: { readOnly?: boolean }) =>
      ReactModule.createElement('div', {
        'data-read-only': String(Boolean(readOnly)),
        'data-testid': 'select-field',
      }),
    toast: uiMocks.toast,
    useAuth: uiMocks.useAuth,
    useDocumentInfo: uiMocks.useDocumentInfo,
    useField: uiMocks.useField,
    useForm: uiMocks.useForm,
    useFormFields: uiMocks.useFormFields,
  }
})

import { SaveAsTemplate } from '@/plugins/pageTemplates/components/SaveAsTemplate'
import { PageTemplatePicker } from '@/plugins/pageTemplates/components/TemplatePicker'
import {
  TemplateLockedArrayField,
  TemplateLockedBlocksField,
  TemplateLockedSelectField,
} from '@/plugins/pageTemplates/components/TemplateStructureFields'
import { setTemplateStructureLock } from '@/plugins/pageTemplates/templateStructureLock'

describe('template structure controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setTemplateStructureLock(false)
    uiMocks.formFields.pageTemplate.value = 'template-1'
    uiMocks.formFields.layout.value = [{ blockType: 'content' }, { blockType: 'archive' }]
    uiMocks.useAuth.mockReturnValue({ user: { role: 'content-editor' } })
    uiMocks.useFormFields.mockImplementation(
      (selector: (state: [typeof uiMocks.formFields, () => void]) => unknown) =>
        selector([uiMocks.formFields, vi.fn()]),
    )
  })

  afterEach(() => cleanup())

  it('locks Hero type and Layout structure for Content Editors using a template', () => {
    const heroProps = {
      field: { name: 'type', options: [] },
      path: 'hero.type',
    } as unknown as React.ComponentProps<typeof TemplateLockedSelectField>
    const layoutProps = {
      field: {
        admin: { isSortable: true },
        blocks: [],
        name: 'layout',
        type: 'blocks',
      },
      path: 'layout',
    } as unknown as React.ComponentProps<typeof TemplateLockedBlocksField>

    render(
      <>
        <TemplateLockedSelectField {...heroProps} />
        <TemplateLockedBlocksField {...layoutProps} />
      </>,
    )

    expect(screen.getByTestId('select-field').getAttribute('data-read-only')).toBe('true')
    expect(screen.getByTestId('blocks-field').getAttribute('data-is-sortable')).toBe('false')
    expect(screen.getByTestId('blocks-field').getAttribute('data-max-rows')).toBe('2')
    expect(
      screen.getByText(/only a Site Admin can change fields that define the template structure/i),
    ).toBeTruthy()
  })

  it('locks Content block column structure while leaving the column fields rendered', () => {
    const columnsProps = {
      field: {
        admin: { isSortable: true },
        fields: [],
        name: 'columns',
        type: 'array',
      },
      path: 'layout.0.columns',
    } as unknown as React.ComponentProps<typeof TemplateLockedArrayField>
    const sizeProps = {
      field: { name: 'size', options: [] },
      path: 'layout.0.columns.0.size',
    } as unknown as React.ComponentProps<typeof TemplateLockedSelectField>

    render(
      <>
        <TemplateLockedArrayField {...columnsProps} />
        <TemplateLockedSelectField {...sizeProps} />
      </>,
    )

    expect(screen.getByTestId('array-field').getAttribute('data-is-sortable')).toBe('false')
    expect(screen.getByTestId('array-field').getAttribute('data-max-rows')).toBe('2')
    expect(screen.getByTestId('select-field').getAttribute('data-read-only')).toBe('true')
  })

  it('uses Payload collection permissions instead of trusting a stale user role', () => {
    uiMocks.useAuth.mockReturnValue({
      permissions: {
        collections: {
          'page-templates': { fields: true, read: true },
        },
      },
      user: { role: 'site-admin' },
    })
    const heroProps = {
      field: { name: 'type', options: [] },
      path: 'hero.type',
    } as unknown as React.ComponentProps<typeof TemplateLockedSelectField>

    render(<TemplateLockedSelectField {...heroProps} />)

    expect(screen.getByTestId('select-field').getAttribute('data-read-only')).toBe('true')
  })

  it('leaves structure controls available to Site Admins', () => {
    uiMocks.useAuth.mockReturnValue({
      permissions: {
        collections: {
          'page-templates': { create: true, fields: true, read: true, update: true },
        },
      },
      user: { role: 'site-admin' },
    })
    const layoutProps = {
      field: {
        admin: { isSortable: true },
        blocks: [],
        name: 'layout',
        type: 'blocks',
      },
      path: 'layout',
    } as unknown as React.ComponentProps<typeof TemplateLockedBlocksField>

    render(<TemplateLockedBlocksField {...layoutProps} />)

    expect(screen.getByTestId('blocks-field').getAttribute('data-is-sortable')).toBe('true')
    expect(screen.getByTestId('blocks-field').getAttribute('data-max-rows')).toBe('unset')
    expect(
      screen.queryByText(/only a Site Admin can change fields that define the template structure/i),
    ).toBeNull()
  })
})

describe('PageTemplatePicker', () => {
  const getData = vi.fn()
  const reset = vi.fn()
  const setPageTemplate = vi.fn()
  const setModified = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    setTemplateStructureLock(false)
    getData.mockReturnValue({
      _status: 'draft',
      slug: 'working-title',
      title: 'Working title',
    })
    reset.mockResolvedValue(undefined)
    uiMocks.useAuth.mockReturnValue({
      permissions: {
        collections: {
          'page-templates': { fields: true, read: true },
        },
      },
      user: { role: 'content-editor' },
    })
    uiMocks.useField.mockReturnValue({ setValue: setPageTemplate })
    uiMocks.useForm.mockReturnValue({ getData, reset, setModified })
    uiMocks.useDocumentInfo.mockReturnValue({
      collectionSlug: 'pages',
      data: { layout: [] },
      hasPublishedDoc: false,
      id: 'autosaved-draft-id',
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            docs: [
              {
                description: 'A validated campaign structure.',
                hero: { type: 'none' },
                id: 'template-1',
                layout: [{ blockType: 'content', columns: [] }],
                title: 'Campaign landing page',
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('remains available after autosave assigns an ID to an empty draft', async () => {
    render(<PageTemplatePicker />)

    const select = await screen.findByLabelText('Page template')

    expect(select).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Blank page' })).toBeTruthy()
    expect(await screen.findByRole('option', { name: 'Campaign landing page' })).toBeTruthy()
  })

  it('applies the editable template fields through Payload form reset and preserves page identity', async () => {
    const picker = render(<PageTemplatePicker />)
    const select = await screen.findByLabelText('Page template')

    fireEvent.change(select, { target: { value: 'template-1' } })

    await waitFor(() =>
      expect(reset).toHaveBeenCalledWith({
        _status: 'draft',
        hero: { type: 'none' },
        layout: [{ blockType: 'content', columns: [] }],
        pageTemplate: 'template-1',
        slug: 'working-title',
        title: 'Working title',
      }),
    )
    expect(setModified).toHaveBeenCalledWith(true)
    expect(setPageTemplate).toHaveBeenCalledWith('template-1', true)
    expect(uiMocks.toast.success).toHaveBeenCalledWith('Campaign landing page applied.')
    expect(screen.getByText('A validated campaign structure.')).toBeTruthy()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('where[_status][equals]=published'),
      expect.any(Object),
    )

    uiMocks.useDocumentInfo.mockReturnValue({
      collectionSlug: 'pages',
      data: { layout: [{ blockType: 'content' }] },
      hasPublishedDoc: false,
      id: 'autosaved-draft-id',
    })
    picker.rerender(<PageTemplatePicker />)
    expect(screen.getByLabelText('Page template')).toBeTruthy()
  })

  it('locks the live structure controls as soon as a Content Editor selects a template', async () => {
    uiMocks.formFields.pageTemplate.value = null
    uiMocks.formFields.layout.value = [{ blockType: 'content' }]
    uiMocks.useAuth.mockReturnValue({ user: { role: 'content-editor' } })
    uiMocks.useFormFields.mockImplementation(
      (selector: (state: [typeof uiMocks.formFields, () => void]) => unknown) =>
        selector([uiMocks.formFields, vi.fn()]),
    )

    const heroProps = {
      field: { name: 'type', options: [] },
      path: 'hero.type',
    } as unknown as React.ComponentProps<typeof TemplateLockedSelectField>
    const layoutProps = {
      field: {
        admin: { isSortable: true },
        blocks: [],
        name: 'layout',
        type: 'blocks',
      },
      path: 'layout',
    } as unknown as React.ComponentProps<typeof TemplateLockedBlocksField>

    render(
      <>
        <PageTemplatePicker />
        <TemplateLockedSelectField {...heroProps} />
        <TemplateLockedBlocksField {...layoutProps} />
      </>,
    )

    const select = await screen.findByLabelText('Page template')
    expect(screen.getByTestId('select-field').getAttribute('data-read-only')).toBe('false')

    fireEvent.change(select, { target: { value: 'template-1' } })

    await waitFor(() =>
      expect(screen.getByTestId('select-field').getAttribute('data-read-only')).toBe('true'),
    )
    expect(screen.getByTestId('blocks-field').getAttribute('data-is-sortable')).toBe('false')
    expect(screen.getByTestId('blocks-field').getAttribute('data-max-rows')).toBe('1')
  })

  it('does not offer templates on published pages or drafts that already have a layout', () => {
    uiMocks.useDocumentInfo.mockReturnValue({
      collectionSlug: 'pages',
      data: { layout: [] },
      hasPublishedDoc: true,
      id: 'published-page',
    })
    const published = render(<PageTemplatePicker />)
    expect(screen.queryByLabelText('Page template')).toBeNull()
    published.unmount()

    uiMocks.useDocumentInfo.mockReturnValue({
      collectionSlug: 'pages',
      data: { layout: [{ blockType: 'content' }] },
      hasPublishedDoc: false,
      id: 'draft-with-content',
    })
    render(<PageTemplatePicker />)
    expect(screen.queryByLabelText('Page template')).toBeNull()
  })
})

describe('SaveAsTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setTemplateStructureLock(false)
    uiMocks.useAuth.mockReturnValue({ user: { role: 'site-admin' } })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 'template-id', message: 'Page template created.' }), {
          status: 200,
        }),
      ),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('is unavailable until the Page has a published version', () => {
    uiMocks.useDocumentInfo.mockReturnValue({
      collectionSlug: 'pages',
      data: { title: 'Draft page' },
      hasPublishedDoc: false,
      id: 'draft-page',
    })

    render(<SaveAsTemplate />)

    expect(screen.queryByRole('button', { name: 'Save as template' })).toBeNull()
  })

  it('is unavailable to Content Editors', () => {
    uiMocks.useAuth.mockReturnValue({ user: { role: 'content-editor' } })
    uiMocks.useDocumentInfo.mockReturnValue({
      collectionSlug: 'pages',
      data: { title: 'Published page' },
      hasPublishedDoc: true,
      id: 'published-page',
    })

    render(<SaveAsTemplate />)

    expect(screen.queryByRole('button', { name: 'Save as template' })).toBeNull()
  })

  it('captures the published page with a title and description', async () => {
    uiMocks.useDocumentInfo.mockReturnValue({
      collectionSlug: 'pages',
      data: { title: 'Published page' },
      hasPublishedDoc: true,
      id: 'published-page-id',
    })

    render(<SaveAsTemplate />)
    fireEvent.click(screen.getByRole('button', { name: 'Save as template' }))

    const title = await screen.findByLabelText('Template name')
    const description = screen.getByLabelText('One-line description')
    fireEvent.change(title, { target: { value: 'Reusable landing page' } })
    fireEvent.change(description, { target: { value: 'A validated landing page structure.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create template' }))

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(fetch).toHaveBeenCalledWith(
      '/api/page-templates/capture',
      expect.objectContaining({
        body: JSON.stringify({
          description: 'A validated landing page structure.',
          pageId: 'published-page-id',
          title: 'Reusable landing page',
        }),
        method: 'POST',
      }),
    )
    expect(uiMocks.toast.success).toHaveBeenCalledWith('Page template created.')
  })
})
