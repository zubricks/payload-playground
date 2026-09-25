import type { Config, Endpoint, Payload, PayloadRequest, User } from 'payload'

import { createLocalReq, getAccessResults, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import configPromise from '@/payload.config'
import { pageTemplatesPlugin } from '@/plugins/pageTemplates'
import { createPageTemplateSnapshot } from '@/plugins/pageTemplates/snapshot'

const testPrefix = `page-template-test-${Date.now()}`

const richText = (text: string) => ({
  root: {
    type: 'root' as const,
    children: [
      {
        type: 'paragraph' as const,
        children: [
          {
            type: 'text' as const,
            detail: 0,
            format: 0,
            mode: 'normal' as const,
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const containsKey = (value: unknown, keyToFind: string): boolean => {
  if (Array.isArray(value)) return value.some((item) => containsKey(item, keyToFind))
  if (!value || typeof value !== 'object') return false

  return Object.entries(value).some(
    ([key, childValue]) => key === keyToFind || containsKey(childValue, keyToFind),
  )
}

const collectValuesForKey = (value: unknown, keyToFind: string): unknown[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectValuesForKey(item, keyToFind))
  }
  if (!value || typeof value !== 'object') return []

  return Object.entries(value).flatMap(([key, childValue]) =>
    key === keyToFind ? [childValue] : collectValuesForKey(childValue, keyToFind),
  )
}

describe('page template snapshots', () => {
  it('copies only template-owned fields without mutating the source', () => {
    const source = {
      _status: 'published',
      createdAt: '2026-09-24T00:00:00.000Z',
      hero: {
        id: 'hero-row-id',
        links: [],
        richText: null,
        type: 'none',
      },
      id: 'page-id',
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              enableLink: false,
              id: 'column-row-id',
              richText: richText('Editable content'),
              size: 'half',
            },
          ],
          id: 'block-row-id',
        },
      ],
      meta: {
        description: '',
        image: 'media-id',
        title: null,
      },
      slug: 'source-page',
      title: 'Source page',
      updatedAt: '2026-09-24T00:00:00.000Z',
    }
    const original = structuredClone(source)

    const snapshot = createPageTemplateSnapshot(source)

    expect(snapshot).toEqual({
      hero: {
        links: [],
        richText: null,
        type: 'none',
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              enableLink: false,
              richText: richText('Editable content'),
              size: 'half',
            },
          ],
        },
      ],
      meta: {
        description: '',
        image: 'media-id',
        title: null,
      },
    })
    expect(source).toEqual(original)
    expect(containsKey(snapshot, 'id')).toBe(false)
    expect(snapshot).not.toHaveProperty('slug')
    expect(snapshot).not.toHaveProperty('title')
    expect(snapshot).not.toHaveProperty('_status')
  })
})

describe('pageTemplatesPlugin config transformation', () => {
  const existingControl = '@/components/ExistingControl'
  const baseConfig = {
    collections: [
      {
        slug: 'pages',
        admin: {
          components: {
            edit: {
              beforeDocumentControls: [existingControl],
            },
          },
        },
        fields: [
          { name: 'title', type: 'text' },
          {
            type: 'tabs',
            tabs: [
              {
                fields: [
                  {
                    name: 'hero',
                    type: 'group',
                    fields: [
                      {
                        name: 'type',
                        type: 'select',
                        options: ['none', 'lowImpact'],
                      },
                    ],
                  },
                ],
                label: 'Hero',
              },
              {
                fields: [
                  {
                    name: 'layout',
                    type: 'blocks',
                    blocks: [
                      {
                        slug: 'mediaBlock',
                        fields: [
                          {
                            name: 'media',
                            type: 'upload',
                            relationTo: 'media',
                            required: true,
                          },
                        ],
                      },
                    ],
                    required: true,
                  },
                ],
                label: 'Content',
              },
            ],
          },
        ],
      },
      {
        slug: 'posts',
        fields: [{ name: 'title', type: 'text' }],
      },
    ],
    endpoints: [
      {
        handler: () => Response.json({ ok: true }),
        method: 'get',
        path: '/existing',
      },
    ],
  } as unknown as Config

  it('adds the collection, endpoint, picker, and document action without replacing existing config', async () => {
    const transformed = await pageTemplatesPlugin()(baseConfig)
    const pages = transformed.collections?.find((collection) => collection.slug === 'pages')
    const posts = transformed.collections?.find((collection) => collection.slug === 'posts')
    const templates = transformed.collections?.find(
      (collection) => collection.slug === 'page-templates',
    )
    const pickerFields = pages?.fields.filter(
      (field) => 'name' in field && field.name === 'pageTemplatePicker',
    )

    expect(
      transformed.collections?.some((collection) => collection.slug === 'page-templates'),
    ).toBe(true)
    expect(transformed.endpoints?.some((endpoint) => endpoint.path === '/existing')).toBe(true)
    expect(
      transformed.endpoints?.some((endpoint) => endpoint.path === '/page-templates/capture'),
    ).toBe(true)
    expect(pickerFields).toHaveLength(1)
    expect(pickerFields?.[0]?.admin?.position).toBe('sidebar')
    expect(pages?.fields.some((field) => 'name' in field && field.name === 'pageTemplate')).toBe(
      true,
    )
    expect(
      pages?.fields.some((field) => 'name' in field && field.name === 'pageTemplateStructure'),
    ).toBe(true)
    expect(templates?.fields.some((field) => field.type === 'tabs')).toBe(true)
    expect(templates?.fields.some((field) => 'name' in field && field.name === 'sourcePage')).toBe(
      false,
    )
    expect(templates?.versions).toMatchObject({ drafts: { validate: false } })
    const pageTabs = baseConfig.collections?.[0]?.fields.find((field) => field.type === 'tabs')
    const templateTabs = templates?.fields.find((field) => field.type === 'tabs')
    const pageLayout =
      pageTabs?.type === 'tabs'
        ? pageTabs.tabs
            .flatMap((tab) => tab.fields)
            .find((field) => 'name' in field && field.name === 'layout')
        : undefined
    const templateLayout =
      templateTabs?.type === 'tabs'
        ? templateTabs.tabs
            .flatMap((tab) => tab.fields)
            .find((field) => 'name' in field && field.name === 'layout')
        : undefined

    expect(pageLayout && 'required' in pageLayout ? pageLayout.required : undefined).toBe(true)
    expect(
      templateLayout && 'required' in templateLayout ? templateLayout.required : undefined,
    ).toBe(false)
    expect(pages?.admin?.components?.edit?.beforeDocumentControls).toEqual([
      existingControl,
      '@/plugins/pageTemplates/components/SaveAsTemplate#SaveAsTemplate',
    ])
    expect(posts).toBe(baseConfig.collections?.[1])
  })

  it('is idempotent when registered more than once', async () => {
    const once = await pageTemplatesPlugin()(baseConfig)
    const twice = await pageTemplatesPlugin()(once)
    const pages = twice.collections?.find((collection) => collection.slug === 'pages')

    expect(
      twice.collections?.filter((collection) => collection.slug === 'page-templates'),
    ).toHaveLength(1)
    expect(
      twice.endpoints?.filter((endpoint) => endpoint.path === '/page-templates/capture'),
    ).toHaveLength(1)
    expect(
      pages?.fields.filter((field) => 'name' in field && field.name === 'pageTemplatePicker'),
    ).toHaveLength(1)
    expect(
      pages?.fields.filter((field) => 'name' in field && field.name === 'pageTemplate'),
    ).toHaveLength(1)
    expect(
      pages?.fields.filter((field) => 'name' in field && field.name === 'pageTemplateStructure'),
    ).toHaveLength(1)
    expect(pages?.hooks?.beforeChange).toHaveLength(1)
    expect(
      pages?.admin?.components?.edit?.beforeDocumentControls?.filter(
        (component) =>
          component === '@/plugins/pageTemplates/components/SaveAsTemplate#SaveAsTemplate',
      ),
    ).toHaveLength(1)
  })

  it('uses registered schema paths for unrelated block and array structures', async () => {
    const customConfig = {
      collections: [
        {
          slug: 'pages',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                {
                  slug: 'featureGrid',
                  fields: [
                    {
                      name: 'cards',
                      type: 'array',
                      fields: [
                        { name: 'width', type: 'select', options: ['half', 'full'] },
                        { name: 'alignment', type: 'radio', options: ['left', 'center'] },
                        { name: 'featured', type: 'checkbox' },
                        { name: 'heading', type: 'text' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    } as unknown as Config

    const transformed = await pageTemplatesPlugin({
      structuralFields: [
        'layout',
        'layout.featureGrid.cards',
        'layout.featureGrid.cards.*.width',
        'layout.featureGrid.cards.*.alignment',
        'layout.featureGrid.cards.*.featured',
      ],
      templateFields: ['layout'],
    })(customConfig)
    const pages = transformed.collections?.find((collection) => collection.slug === 'pages')
    const fieldComponents = collectValuesForKey(pages?.fields, 'Field')

    expect(fieldComponents).toEqual(
      expect.arrayContaining([
        '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedBlocksField',
        '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedArrayField',
        '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedCheckboxField',
        '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedRadioField',
        '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedSelectField',
      ]),
    )
    expect(fieldComponents).not.toContain(
      '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedTextField',
    )

    const structureHook = pages?.hooks?.beforeChange?.[0]
    const template = {
      _status: 'published',
      layout: [
        {
          blockType: 'featureGrid',
          cards: [
            {
              alignment: 'left',
              featured: true,
              heading: 'Template heading',
              width: 'half',
            },
          ],
        },
      ],
    }
    const req = {
      payload: { findByID: vi.fn().mockResolvedValue(template) },
      user: { role: 'content-editor' },
    }
    const editableContent = {
      layout: [
        {
          blockType: 'featureGrid',
          cards: [{ alignment: 'left', featured: true, heading: 'Editor heading', width: 'half' }],
        },
      ],
      pageTemplate: 'template-1',
    }

    const accepted = await structureHook?.({
      data: editableContent,
      operation: 'create',
      originalDoc: {},
      req,
    } as never)

    expect(accepted?.pageTemplateStructure).toEqual({
      fields: {
        layout: [
          {
            blockType: 'featureGrid',
            cards: [{ alignment: 'left', featured: true, width: 'half' }],
          },
        ],
      },
      version: 3,
    })

    await expect(
      structureHook?.({
        data: {
          ...editableContent,
          layout: [
            {
              blockType: 'featureGrid',
              cards: [
                { alignment: 'left', featured: true, heading: 'Editor heading', width: 'full' },
              ],
            },
          ],
        },
        operation: 'create',
        originalDoc: {},
        req,
      } as never),
    ).rejects.toThrow(/locked template structure/i)
  })

  it('fails fast when a registered structural path cannot be locked', async () => {
    expect(() =>
      pageTemplatesPlugin({ structuralFields: ['layout.featureGrid.missing'] })(baseConfig),
    ).toThrow(/could not lock these structural fields/i)
  })

  it('returns the original config when disabled', async () => {
    const transformed = await pageTemplatesPlugin({ enabled: false })(baseConfig)
    expect(transformed).toBe(baseConfig)
  })
})

describe('page template capture endpoint and access', () => {
  let payload: Payload
  let user: User
  let contentEditor: User
  let endpoint: Endpoint
  const pageIDs: string[] = []
  const templateIDs: string[] = []

  const makeRequest = async (
    body: unknown,
    authenticated = true,
    requestUser: User = user,
  ): Promise<PayloadRequest> =>
    createLocalReq(
      {
        req: {
          json: async () => body,
        },
        user: authenticated ? requestUser : undefined,
      },
      payload,
    )

  const createPage = async ({ draft = false }: { draft?: boolean } = {}) => {
    const page = await payload.create({
      collection: 'pages',
      context: { disableRevalidate: true },
      data: {
        _status: draft ? 'draft' : 'published',
        hero: {
          type: 'none',
        },
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                enableLink: false,
                richText: richText('Template fixture content'),
                size: 'half',
              },
            ],
          },
        ],
        meta: {
          description: 'Template fixture description',
        },
        slug: `${testPrefix}-${draft ? 'draft' : 'published'}-${pageIDs.length}`,
        title: `${testPrefix} ${draft ? 'draft' : 'published'} ${pageIDs.length}`,
      },
      depth: 0,
      draft,
      overrideAccess: true,
    })

    pageIDs.push(page.id)
    return page
  }

  beforeAll(async () => {
    const config = await configPromise
    payload = await getPayload({ config })
    user = await payload.create({
      collection: 'users',
      data: {
        email: `${testPrefix}@example.com`,
        password: 'test-password',
        role: 'site-admin',
      },
      overrideAccess: true,
    })
    contentEditor = await payload.create({
      collection: 'users',
      data: {
        email: `${testPrefix}-editor@example.com`,
        password: 'test-password',
        role: 'content-editor',
      },
      overrideAccess: true,
    })
    endpoint = payload.config.endpoints?.find(
      (candidate) => candidate.method === 'post' && candidate.path === '/page-templates/capture',
    ) as Endpoint
  }, 30_000)

  afterAll(async () => {
    if (!payload) return

    if (templateIDs.length > 0) {
      await payload.delete({
        collection: 'page-templates',
        overrideAccess: true,
        where: { id: { in: templateIDs } },
      })
    }

    if (pageIDs.length > 0) {
      await payload.delete({
        collection: 'pages',
        context: { disableRevalidate: true },
        overrideAccess: true,
        where: { id: { in: pageIDs } },
      })
    }

    if (user) {
      await payload.delete({
        collection: 'users',
        overrideAccess: true,
        where: { id: { equals: user.id } },
      })
    }

    if (contentEditor) {
      await payload.delete({
        collection: 'users',
        overrideAccess: true,
        where: { id: { equals: contentEditor.id } },
      })
    }
  }, 30_000)

  it('registers the capture endpoint', () => {
    expect(endpoint).toBeDefined()
  })

  it('exposes template management through Payload access-operation permissions', async () => {
    const [siteAdminPermissions, editorPermissions] = await Promise.all([
      getAccessResults({
        req: await createLocalReq({ user }, payload),
      }),
      getAccessResults({
        req: await createLocalReq({ user: contentEditor }, payload),
      }),
    ])

    expect(siteAdminPermissions.collections?.['page-templates']?.create).toBe(true)
    expect(siteAdminPermissions.collections?.['page-templates']?.update).toBe(true)
    expect(editorPermissions.collections?.['page-templates']?.read).toBe(true)
    expect(editorPermissions.collections?.['page-templates']?.create).toBeUndefined()
    expect(editorPermissions.collections?.['page-templates']?.update).toBeUndefined()
  })

  it('rejects unauthenticated capture requests', async () => {
    const response = await endpoint.handler(await makeRequest({}, false))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ message: expect.any(String) })
  })

  it('rejects capture requests from Content Editors', async () => {
    const response = await endpoint.handler(await makeRequest({}, true, contentEditor))

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({
      message: expect.stringContaining('Site Admin'),
    })
  })

  it('rejects incomplete input and missing source pages', async () => {
    const missingInput = await endpoint.handler(await makeRequest({}))
    const missingPage = await endpoint.handler(
      await makeRequest({ pageId: '000000000000000000000000', title: 'Missing page' }),
    )

    expect(missingInput.status).toBe(400)
    expect(missingPage.status).toBe(404)
  })

  it('rejects draft-only pages as template sources', async () => {
    const page = await createPage({ draft: true })
    const response = await endpoint.handler(
      await makeRequest({ pageId: page.id, title: `${testPrefix} rejected draft` }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      message: expect.stringContaining('published'),
    })
  })

  it('captures a published page as an independently editable template', async () => {
    const page = await createPage()
    const title = `${testPrefix} captured template`
    const response = await endpoint.handler(
      await makeRequest({
        description: 'Captured by the integration test.',
        pageId: page.id,
        title,
      }),
    )
    const responseBody = (await response.json()) as { id: string }
    templateIDs.push(responseBody.id)

    const template = await payload.findByID({
      collection: 'page-templates',
      depth: 0,
      id: responseBody.id,
      overrideAccess: true,
    })

    expect(response.status).toBe(200)
    expect(template.title).toBe(title)
    expect(template.description).toBe('Captured by the integration test.')
    expect(template._status).toBe('published')
    expect(template.hero).toMatchObject({ type: 'none' })
    expect(template.layout).toMatchObject([
      {
        blockType: 'content',
        columns: [
          {
            enableLink: false,
            size: 'half',
          },
        ],
      },
    ])
    expect(template.meta).toMatchObject({ description: 'Template fixture description' })
    expect(template).not.toHaveProperty('sourcePage')
    const sourceRowIDs = collectValuesForKey(
      { hero: page.hero, layout: page.layout, meta: page.meta },
      'id',
    )
    const templateRowIDs = collectValuesForKey(
      { hero: template.hero, layout: template.layout, meta: template.meta },
      'id',
    )

    expect(templateRowIDs.length).toBeGreaterThan(0)
    expect(templateRowIDs.some((id) => sourceRowIDs.includes(id))).toBe(false)
  })

  it('allows Site Admins to draft an incomplete template and publish it once valid', async () => {
    const req = await makeRequest({})
    const template = await payload.create({
      collection: 'page-templates',
      data: {
        _status: 'draft',
        title: `${testPrefix} editable draft`,
      } as never,
      draft: true,
      overrideAccess: false,
      req,
    })
    templateIDs.push(template.id)

    expect(template._status).toBe('draft')

    const published = await payload.update({
      collection: 'page-templates',
      data: {
        _status: 'published',
        hero: { type: 'none' },
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                enableLink: false,
                richText: richText('Editable template content'),
                size: 'half',
              },
            ],
          },
        ],
      } as never,
      draft: false,
      id: template.id,
      overrideAccess: false,
      req,
    })

    expect(published._status).toBe('published')
    expect(published.layout).toHaveLength(1)
  })

  it('allows only Site Admins to create, update, or delete templates', async () => {
    const editorReq = await makeRequest({}, true, contentEditor)

    await expect(
      payload.create({
        collection: 'page-templates',
        data: {
          _status: 'draft',
          title: `${testPrefix} forbidden editor template`,
        } as never,
        draft: true,
        overrideAccess: false,
        req: editorReq,
      }),
    ).rejects.toThrow()

    const existingTemplate = await payload.create({
      collection: 'page-templates',
      data: {
        _status: 'draft',
        title: `${testPrefix} admin template`,
      } as never,
      draft: true,
      overrideAccess: true,
    })
    templateIDs.push(existingTemplate.id)

    await expect(
      payload.update({
        collection: 'page-templates',
        data: { title: `${testPrefix} forbidden update` },
        id: existingTemplate.id,
        overrideAccess: false,
        req: editorReq,
      }),
    ).rejects.toThrow()

    await expect(
      payload.delete({
        collection: 'page-templates',
        id: existingTemplate.id,
        overrideAccess: false,
        req: editorReq,
      }),
    ).rejects.toThrow()
  })

  it('publishes template blocks with empty required placeholders while Pages remain strict', async () => {
    const placeholderLayout = [
      {
        blockType: 'content',
        columns: [],
      },
      {
        blockType: 'mediaBlock',
      },
      {
        blockType: 'cta',
        links: [
          {
            link: {
              type: 'reference',
            },
          },
        ],
      },
    ]

    await expect(
      payload.create({
        collection: 'pages',
        context: { disableRevalidate: true },
        data: {
          _status: 'published',
          hero: { type: 'none' },
          layout: placeholderLayout,
          slug: `${testPrefix}-invalid-placeholder-page`,
          title: `${testPrefix} invalid placeholder page`,
        } as never,
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow()

    const req = await makeRequest({})
    const template = await payload.create({
      collection: 'page-templates',
      data: {
        _status: 'published',
        hero: { type: 'none' },
        layout: placeholderLayout,
        title: `${testPrefix} placeholder template`,
      } as never,
      draft: false,
      overrideAccess: false,
      req,
    })
    templateIDs.push(template.id)

    expect(template._status).toBe('published')
    expect(template.layout).toHaveLength(3)
  })

  it('locks template structure for Content Editors while allowing content and Site Admin changes', async () => {
    const template = await payload.create({
      collection: 'page-templates',
      data: {
        _status: 'published',
        hero: { type: 'none' },
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                enableLink: false,
                richText: richText('Template column content'),
                size: 'half',
              },
            ],
          },
          { blockType: 'archive', populateBy: 'collection', relationTo: 'posts' },
        ],
        title: `${testPrefix} locked structure template`,
      } as never,
      draft: false,
      overrideAccess: true,
    })
    templateIDs.push(template.id)

    const editorReq = await makeRequest({}, true, contentEditor)
    const page = await payload.create({
      collection: 'pages',
      context: { disableRevalidate: true },
      data: {
        _status: 'draft',
        hero: { type: 'none' },
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                enableLink: false,
                richText: richText('Editor supplied content'),
                size: 'half',
              },
            ],
          },
          { blockType: 'archive', populateBy: 'collection', relationTo: 'posts' },
        ],
        pageTemplate: template.id,
        slug: `${testPrefix}-locked-page`,
        title: `${testPrefix} locked page`,
      } as never,
      draft: true,
      overrideAccess: false,
      req: editorReq,
    })
    pageIDs.push(page.id)

    expect(page.pageTemplateStructure).toEqual({
      fields: {
        hero: { type: 'none' },
        layout: [{ blockType: 'content', columns: [{ size: 'half' }] }, { blockType: 'archive' }],
      },
      version: 3,
    })

    const contentUpdate = await payload.update({
      collection: 'pages',
      context: { disableRevalidate: true },
      data: {
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                enableLink: false,
                richText: richText('Updated editor content'),
                size: 'half',
              },
            ],
          },
          { blockType: 'archive', populateBy: 'collection', relationTo: 'posts' },
        ],
      } as never,
      draft: true,
      id: page.id,
      overrideAccess: false,
      req: editorReq,
    })

    expect(contentUpdate.layout).toHaveLength(2)

    for (const forbiddenData of [
      {
        layout: [
          { blockType: 'archive', populateBy: 'collection', relationTo: 'posts' },
          { blockType: 'content', columns: [] },
        ],
      },
      { layout: [{ blockType: 'content', columns: [] }] },
      {
        layout: [
          { blockType: 'content', columns: [] },
          { blockType: 'archive', populateBy: 'collection', relationTo: 'posts' },
          { blockType: 'content', columns: [] },
        ],
      },
      { hero: { type: 'lowImpact' } },
      {
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                enableLink: false,
                richText: richText('Changed column size'),
                size: 'full',
              },
            ],
          },
          { blockType: 'archive', populateBy: 'collection', relationTo: 'posts' },
        ],
      },
      {
        layout: [
          {
            blockType: 'content',
            columns: [],
          },
          { blockType: 'archive', populateBy: 'collection', relationTo: 'posts' },
        ],
      },
      {
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                enableLink: false,
                richText: richText('Column one'),
                size: 'half',
              },
              {
                enableLink: false,
                richText: richText('Added column'),
                size: 'half',
              },
            ],
          },
          { blockType: 'archive', populateBy: 'collection', relationTo: 'posts' },
        ],
      },
    ]) {
      await expect(
        payload.update({
          collection: 'pages',
          context: { disableRevalidate: true },
          data: forbiddenData as never,
          draft: true,
          id: page.id,
          overrideAccess: false,
          req: editorReq,
        }),
      ).rejects.toThrow(/locked template structure/)
    }

    const adminReq = await makeRequest({}, true, user)
    const adminUpdate = await payload.update({
      collection: 'pages',
      context: { disableRevalidate: true },
      data: {
        layout: [
          { blockType: 'archive', populateBy: 'collection', relationTo: 'posts' },
          { blockType: 'content', columns: [] },
        ],
      } as never,
      draft: true,
      id: page.id,
      overrideAccess: false,
      req: adminReq,
    })

    expect(adminUpdate.pageTemplateStructure).toEqual({
      fields: {
        hero: { type: 'none' },
        layout: [{ blockType: 'archive' }, { blockType: 'content', columns: [] }],
      },
      version: 3,
    })
  })

  it('opens legacy snapshots as editable fields and removes the snapshot after saving', async () => {
    const legacyTemplate = await payload.create({
      collection: 'page-templates',
      data: {
        _status: 'draft',
        snapshot: {
          hero: { type: 'none' },
          layout: [
            {
              blockType: 'content',
              columns: [
                {
                  enableLink: false,
                  richText: richText('Legacy template content'),
                  size: 'half',
                },
              ],
            },
          ],
          meta: { description: 'Legacy template description' },
        },
        title: `${testPrefix} legacy template`,
      } as never,
      draft: true,
      overrideAccess: true,
    })
    templateIDs.push(legacyTemplate.id)

    const editableTemplate = await payload.findByID({
      collection: 'page-templates',
      draft: true,
      id: legacyTemplate.id,
      overrideAccess: true,
    })

    expect(editableTemplate.hero).toMatchObject({ type: 'none' })
    expect(editableTemplate.layout).toHaveLength(1)

    const migratedTemplate = await payload.update({
      collection: 'page-templates',
      data: {
        hero: editableTemplate.hero,
        layout: editableTemplate.layout,
        meta: editableTemplate.meta,
      },
      draft: true,
      id: legacyTemplate.id,
      overrideAccess: true,
    })

    expect(migratedTemplate.snapshot).toBeNull()
    expect(migratedTemplate.layout).toHaveLength(1)
  })
})
