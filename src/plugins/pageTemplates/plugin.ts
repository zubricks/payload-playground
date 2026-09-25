import type {
  CollectionBeforeChangeHook,
  CollectionConfig,
  Config,
  Endpoint,
  Field,
  Plugin,
  UIField,
} from 'payload'
import { APIError } from 'payload'

import { isSiteAdmin, siteAdmins } from '@/access/siteAdmins'
import { createPageTemplateSnapshot } from './snapshot'

export type PageTemplatesPluginOptions = {
  collection?: 'pages'
  enabled?: boolean
  /** Fields copied from a Page into a Page Template. */
  templateFields?: string[]
  /**
   * Schema-aware paths whose shape is owned by a template. Blocks use their slug in the path and
   * array children use `*`, for example `layout.content.columns.*.size`.
   */
  structuralFields?: string[]
}

const isAuthenticated = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

type PageStructure = { fields: Record<string, unknown>; version: 3 }

const defaultStructuralFields = ['hero.type', 'layout']
const defaultTemplateFields = ['hero', 'layout', 'meta']

const getRelationshipID = (value: unknown): null | number | string => {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return id
  }

  return null
}

const hasRegisteredPath = (registeredPaths: Set<string>, path: string): boolean =>
  registeredPaths.has(path) || [...registeredPaths].some((item) => item.startsWith(`${path}.`))

const extractStructure = (
  fields: Field[],
  data: Record<string, unknown>,
  registeredPaths: Set<string>,
  parentPath: string[] = [],
): Record<string, unknown> => {
  const result: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const tabName = 'name' in tab && typeof tab.name === 'string' ? tab.name : null
        const tabPath = tabName ? [...parentPath, tabName] : parentPath
        const tabData = tabName
          ? ((data[tabName] as Record<string, unknown> | undefined) ?? {})
          : data
        const nested = extractStructure(tab.fields, tabData, registeredPaths, tabPath)

        if (tabName && Object.keys(nested).length) result[tabName] = nested
        if (!tabName) Object.assign(result, nested)
      }
      continue
    }

    if ((field.type === 'row' || field.type === 'collapsible') && 'fields' in field) {
      Object.assign(result, extractStructure(field.fields, data, registeredPaths, parentPath))
      continue
    }

    if (!('name' in field) || typeof field.name !== 'string') continue

    const currentPath = [...parentPath, field.name]
    const path = currentPath.join('.')
    if (!hasRegisteredPath(registeredPaths, path)) continue

    const value = data[field.name]

    if (field.type === 'blocks') {
      const rows = Array.isArray(value) ? value : []
      result[field.name] = rows.map((rowValue) => {
        const row = (rowValue ?? {}) as Record<string, unknown>
        const blockType = typeof row.blockType === 'string' ? row.blockType : ''
        const block = field.blocks.find((item) => item.slug === blockType)
        const nested = block
          ? extractStructure(block.fields, row, registeredPaths, [...currentPath, blockType])
          : {}

        return { blockType, ...nested }
      })
      continue
    }

    if (field.type === 'array') {
      const rows = Array.isArray(value) ? value : []
      result[field.name] = rows.map((rowValue) =>
        extractStructure(
          field.fields,
          ((rowValue ?? {}) as Record<string, unknown>) || {},
          registeredPaths,
          [...currentPath, '*'],
        ),
      )
      continue
    }

    if (field.type === 'group') {
      result[field.name] = extractStructure(
        field.fields,
        ((value ?? {}) as Record<string, unknown>) || {},
        registeredPaths,
        currentPath,
      )
      continue
    }

    if (registeredPaths.has(path)) result[field.name] = cloneConfigValue(value)
  }

  return result
}

const getPageStructure = (
  fields: Field[],
  registeredPaths: Set<string>,
  value: unknown,
): PageStructure => ({
  fields: extractStructure(
    fields,
    ((value ?? {}) as Record<string, unknown>) || {},
    registeredPaths,
  ),
  version: 3,
})

const structuresMatch = (left: PageStructure, right: PageStructure): boolean =>
  JSON.stringify(left.fields) === JSON.stringify(right.fields)

const createEnforceTemplateStructure = (
  sourceFields: Field[],
  registeredPaths: Set<string>,
): CollectionBeforeChangeHook => {
  const hook: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req }) => {
    const originalTemplateID = getRelationshipID(originalDoc?.pageTemplate)
    const submittedTemplateID = getRelationshipID(data.pageTemplate)
    const hasSubmittedTemplate = Object.prototype.hasOwnProperty.call(data, 'pageTemplate')
    const templateID = hasSubmittedTemplate ? submittedTemplateID : originalTemplateID
    const candidatePage = { ...originalDoc, ...data }

    if (!req.user || isSiteAdmin(req.user)) {
      if (templateID) {
        data.pageTemplateStructure = getPageStructure(sourceFields, registeredPaths, candidatePage)
      }
      if (hasSubmittedTemplate && !templateID) data.pageTemplateStructure = null
      return data
    }

    if (originalTemplateID && hasSubmittedTemplate && submittedTemplateID !== originalTemplateID) {
      throw new APIError('Only a Site Admin can change the template assigned to this Page.', 403)
    }

    if (!templateID) return data

    let expectedStructure = originalDoc?.pageTemplateStructure as PageStructure | null | undefined

    if (operation === 'create' || !expectedStructure || expectedStructure.version !== 3) {
      const template = await req.payload.findByID({
        collection: 'page-templates',
        depth: 0,
        disableErrors: true,
        draft: false,
        id: templateID,
        overrideAccess: false,
        req,
      })

      if (!template || template._status !== 'published') {
        throw new APIError('The selected Page Template is not available.', 400)
      }

      expectedStructure = getPageStructure(sourceFields, registeredPaths, template)
    }

    if (
      !structuresMatch(
        getPageStructure(sourceFields, registeredPaths, candidatePage),
        expectedStructure,
      )
    ) {
      throw new APIError(
        'This Page uses a locked template structure. Only a Site Admin can change fields that define the template structure.',
        403,
      )
    }

    data.pageTemplate = templateID
    data.pageTemplateStructure = expectedStructure

    return data
  }

  Object.assign(hook, { __pageTemplatesStructureHook: true })
  return hook
}

const getThumbnailID = (page: unknown): null | string => {
  const media = (page as { hero?: { media?: unknown } })?.hero?.media

  if (typeof media === 'string') return media
  if (typeof media === 'number') return String(media)
  if (media && typeof media === 'object' && 'id' in media) {
    const id = (media as { id?: unknown }).id
    if (typeof id === 'string') return id
    if (typeof id === 'number') return String(id)
  }

  return null
}

const cloneConfigValue = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map(cloneConfigValue) as T

  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, childValue]) => [key, cloneConfigValue(childValue)]),
    ) as T
  }

  return value
}

const relaxTemplateField = (field: Field): Field => {
  const relaxedField = cloneConfigValue(field)
  const fieldConfig = relaxedField as unknown as Record<string, unknown>

  if ('required' in fieldConfig) fieldConfig.required = false
  delete fieldConfig.minRows
  delete fieldConfig.validate

  if (Array.isArray(fieldConfig.fields)) {
    fieldConfig.fields = (fieldConfig.fields as Field[]).map(relaxTemplateField)
  }

  if (Array.isArray(fieldConfig.tabs)) {
    fieldConfig.tabs = (fieldConfig.tabs as Array<Record<string, unknown>>).map((tab) => ({
      ...tab,
      fields: Array.isArray(tab.fields)
        ? (tab.fields as Field[]).map(relaxTemplateField)
        : tab.fields,
    }))
  }

  if (relaxedField.type === 'blocks' && Array.isArray(fieldConfig.blocks)) {
    fieldConfig.blocks = (fieldConfig.blocks as Array<Record<string, unknown>>).map((block) => ({
      ...block,
      fields: Array.isArray(block.fields)
        ? (block.fields as Field[]).map(relaxTemplateField)
        : block.fields,
    }))
  }

  return relaxedField
}

const addStructureLockComponents = (
  field: Field,
  componentPaths: Record<'array' | 'blocks' | 'checkbox' | 'radio' | 'select', string>,
  registeredPaths: Set<string>,
  matchedPaths: Set<string>,
  parentPath: string[] = [],
): Field => {
  const nextField = cloneConfigValue(field)
  const fieldName =
    'name' in nextField && typeof nextField.name === 'string' ? nextField.name : null
  const currentPath = fieldName ? [...parentPath, fieldName] : parentPath
  const path = currentPath.join('.')
  const fieldConfig = nextField as unknown as Record<string, unknown>

  if (
    registeredPaths.has(path) &&
    ['array', 'blocks', 'checkbox', 'radio', 'select'].includes(nextField.type)
  ) {
    const componentPath = componentPaths[nextField.type as keyof typeof componentPaths]
    const admin = (fieldConfig.admin ?? {}) as Record<string, unknown>
    fieldConfig.admin = {
      ...admin,
      components: {
        ...((admin.components as Record<string, unknown> | undefined) ?? {}),
        Field: componentPath,
      },
    }
    matchedPaths.add(path)
  }

  if (Array.isArray(fieldConfig.fields)) {
    fieldConfig.fields = (fieldConfig.fields as Field[]).map((childField) =>
      addStructureLockComponents(
        childField,
        componentPaths,
        registeredPaths,
        matchedPaths,
        nextField.type === 'array' ? [...currentPath, '*'] : currentPath,
      ),
    )
  }

  if (Array.isArray(fieldConfig.tabs)) {
    fieldConfig.tabs = (fieldConfig.tabs as Array<Record<string, unknown>>).map((tab) => ({
      ...tab,
      fields: Array.isArray(tab.fields)
        ? (tab.fields as Field[]).map((childField) =>
            addStructureLockComponents(
              childField,
              componentPaths,
              registeredPaths,
              matchedPaths,
              'name' in tab && typeof tab.name === 'string'
                ? [...currentPath, tab.name]
                : currentPath,
            ),
          )
        : tab.fields,
    }))
  }

  if (nextField.type === 'blocks' && Array.isArray(fieldConfig.blocks)) {
    fieldConfig.blocks = (fieldConfig.blocks as Array<Record<string, unknown>>).map((block) => ({
      ...block,
      fields: Array.isArray(block.fields)
        ? (block.fields as Field[]).map((childField) =>
            addStructureLockComponents(childField, componentPaths, registeredPaths, matchedPaths, [
              ...currentPath,
              typeof block.slug === 'string' ? block.slug : '',
            ]),
          )
        : block.fields,
    }))
  }

  return nextField
}

const selectTemplateSchemaFields = (fields: Field[], templateFields: Set<string>): Field[] =>
  fields.flatMap((field): Field[] => {
    if (field.type === 'tabs') {
      const tabs = field.tabs.flatMap((tab) => {
        const tabName = 'name' in tab && typeof tab.name === 'string' ? tab.name : null
        if (tabName && templateFields.has(tabName)) return [tab]
        if (tabName) return []

        const tabFields = selectTemplateSchemaFields(tab.fields, templateFields)
        return tabFields.length ? [{ ...tab, fields: tabFields }] : []
      })

      return tabs.length ? [{ ...field, tabs }] : []
    }

    if ((field.type === 'row' || field.type === 'collapsible') && 'fields' in field) {
      const nestedFields = selectTemplateSchemaFields(field.fields, templateFields)
      return nestedFields.length ? [{ ...field, fields: nestedFields }] : []
    }

    return 'name' in field && templateFields.has(field.name) ? [field] : []
  })

const createTemplateCollection = (
  contentFields: Field[],
  templateFields: string[],
): CollectionConfig => ({
  slug: 'page-templates',
  access: {
    create: siteAdmins,
    delete: siteAdmins,
    read: isAuthenticated,
    update: siteAdmins,
  },
  admin: {
    defaultColumns: ['title', '_status', 'updatedAt'],
    description: 'Create and edit reusable page structures with the same fields used by Pages.',
    group: 'Content',
    hidden: ({ user }) => !isSiteAdmin(user),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Explain when an editor should choose this template.',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'media',
    },
    ...contentFields.map(relaxTemplateField),
    {
      name: 'snapshot',
      type: 'json',
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    afterRead: [
      ({ doc }) => {
        const legacySnapshot = doc.snapshot as Record<string, unknown> | null | undefined

        if (legacySnapshot) {
          for (const fieldName of templateFields) doc[fieldName] = legacySnapshot[fieldName]
        }

        return doc
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (
          originalDoc?.snapshot &&
          templateFields.some((fieldName) => data[fieldName] !== undefined)
        ) {
          data.snapshot = null
        }

        return data
      },
    ],
  },
  timestamps: true,
  versions: {
    drafts: {
      validate: false,
    },
    maxPerDoc: 20,
  },
})

const createCaptureEndpoint = (collection: 'pages', templateFields: string[]): Endpoint => ({
  path: '/page-templates/capture',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json(
        { message: 'You must be logged in to create a template.' },
        { status: 401 },
      )
    }

    if (!isSiteAdmin(req.user)) {
      return Response.json(
        { message: 'Only a Site Admin can create Page Templates.' },
        { status: 403 },
      )
    }

    const body = (await req.json?.()) as
      | {
          description?: string
          pageId?: number | string
          title?: string
        }
      | undefined

    if (!body?.pageId || !body.title?.trim()) {
      return Response.json(
        { message: 'A source page and template title are required.' },
        { status: 400 },
      )
    }

    const page = await req.payload.findByID({
      collection,
      depth: 0,
      disableErrors: true,
      draft: false,
      id: body.pageId,
      overrideAccess: false,
      req,
    })

    if (!page) {
      return Response.json({ message: 'The source Page could not be found.' }, { status: 404 })
    }

    if (page._status !== 'published') {
      return Response.json(
        { message: 'Only a published Page can be captured as a template.' },
        { status: 400 },
      )
    }

    const template = await req.payload.create({
      collection: 'page-templates',
      data: {
        ...createPageTemplateSnapshot(page, templateFields),
        _status: 'published',
        description: body.description?.trim() || undefined,
        thumbnail: getThumbnailID(page) || undefined,
        title: body.title.trim(),
      } as never,
      draft: false,
      overrideAccess: true,
      req,
    })

    return Response.json({ id: template.id, message: 'Page template created.' })
  },
})

export const pageTemplatesPlugin =
  ({
    collection = 'pages',
    enabled = true,
    structuralFields = defaultStructuralFields,
    templateFields = defaultTemplateFields,
  }: PageTemplatesPluginOptions = {}): Plugin =>
  (config: Config): Config => {
    if (!enabled) return config

    const templatePickerPath =
      '@/plugins/pageTemplates/components/TemplatePicker#PageTemplatePicker'
    const saveAsTemplatePath = '@/plugins/pageTemplates/components/SaveAsTemplate#SaveAsTemplate'
    const componentPaths = {
      array: '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedArrayField',
      blocks:
        '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedBlocksField',
      checkbox:
        '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedCheckboxField',
      radio: '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedRadioField',
      select:
        '@/plugins/pageTemplates/components/TemplateStructureFields#TemplateLockedSelectField',
    }
    const sourceCollection = config.collections?.find(
      (collectionConfig) => collectionConfig.slug === collection,
    )
    const templateContentFields = selectTemplateSchemaFields(
      sourceCollection?.fields || [],
      new Set(templateFields),
    )
    const registeredPaths = new Set(structuralFields)
    const matchedPaths = new Set<string>()
    const enforceTemplateStructure = createEnforceTemplateStructure(
      sourceCollection?.fields || [],
      registeredPaths,
    )

    const templatePickerField: UIField = {
      name: 'pageTemplatePicker',
      type: 'ui',
      admin: {
        components: {
          Field: templatePickerPath,
        },
        position: 'sidebar',
      },
    }

    return {
      ...config,
      collections: [
        ...(config.collections || []).map((collectionConfig) => {
          if (collectionConfig.slug !== collection) return collectionConfig

          const editComponents = collectionConfig.admin?.components?.edit || {}
          const beforeDocumentControls = editComponents.beforeDocumentControls || []
          const beforeChangeHooks = collectionConfig.hooks?.beforeChange || []
          const hasTemplatePicker = collectionConfig.fields.some(
            (field) => 'name' in field && field.name === templatePickerField.name,
          )
          const hasPageTemplateField = collectionConfig.fields.some(
            (field) => 'name' in field && field.name === 'pageTemplate',
          )
          const hasPageTemplateStructureField = collectionConfig.fields.some(
            (field) => 'name' in field && field.name === 'pageTemplateStructure',
          )
          const lockedPageFields = collectionConfig.fields.map((field) =>
            addStructureLockComponents(field, componentPaths, registeredPaths, matchedPaths),
          )

          const unsupportedPaths = structuralFields.filter((path) => !matchedPaths.has(path))
          if (unsupportedPaths.length) {
            throw new Error(
              `Page Templates could not lock these structural fields: ${unsupportedPaths.join(', ')}. Registered structural fields must resolve to a blocks, array, select, radio, or checkbox field.`,
            )
          }

          const hasStructureHook = beforeChangeHooks.some(
            (hook) =>
              (
                hook as CollectionBeforeChangeHook & {
                  __pageTemplatesStructureHook?: boolean
                }
              ).__pageTemplatesStructureHook === true,
          )

          return {
            ...collectionConfig,
            admin: {
              ...collectionConfig.admin,
              components: {
                ...collectionConfig.admin?.components,
                edit: {
                  ...editComponents,
                  beforeDocumentControls: [
                    ...beforeDocumentControls,
                    ...(beforeDocumentControls.includes(saveAsTemplatePath)
                      ? []
                      : [saveAsTemplatePath]),
                  ],
                },
              },
            },
            fields: [
              ...(hasTemplatePicker ? [] : [templatePickerField]),
              ...(hasPageTemplateField
                ? []
                : [
                    {
                      name: 'pageTemplate',
                      type: 'relationship',
                      admin: { hidden: true },
                      relationTo: 'page-templates',
                    } satisfies Field,
                  ]),
              ...(hasPageTemplateStructureField
                ? []
                : [
                    {
                      name: 'pageTemplateStructure',
                      type: 'json',
                      admin: { hidden: true },
                    } satisfies Field,
                  ]),
              ...lockedPageFields,
            ],
            hooks: {
              ...collectionConfig.hooks,
              beforeChange: [
                ...(hasStructureHook ? [] : [enforceTemplateStructure]),
                ...beforeChangeHooks,
              ],
            },
          }
        }),
        ...(config.collections?.some((item) => item.slug === 'page-templates')
          ? []
          : [createTemplateCollection(templateContentFields, templateFields)]),
      ],
      endpoints: [
        ...(config.endpoints || []),
        ...(config.endpoints?.some(
          (endpoint) => endpoint.method === 'post' && endpoint.path === '/page-templates/capture',
        )
          ? []
          : [createCaptureEndpoint(collection, templateFields)]),
      ],
    }
  }
