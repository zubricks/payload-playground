'use client'

import { SelectInput, toast, useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { setTemplateStructureLock } from '../../templateStructureLock'
import { useCanManagePageTemplates } from '../../useCanManagePageTemplates'

import './index.scss'

type Template = {
  description?: null | string
  hero?: null | Record<string, unknown>
  id: number | string
  layout?: null | unknown[]
  meta?: null | Record<string, unknown>
  snapshot?: null | Record<string, unknown>
  thumbnail?:
    | null
    | string
    | {
        alt?: null | string
        url?: null | string
      }
  title: string
}

export const PageTemplatePicker: React.FC = () => {
  const { collectionSlug, data, hasPublishedDoc } = useDocumentInfo()
  const { getData, reset, setModified } = useForm()
  const canManagePageTemplates = useCanManagePageTemplates()
  const { setValue: setPageTemplate } = useField<number | string | null>({
    path: 'pageTemplate',
  })
  const [activeTemplate, setActiveTemplate] = useState<number | string>('blank')
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const wasEligible = useRef(false)
  const hasEmptyLayout = !Array.isArray(data?.layout) || data.layout.length === 0

  if (collectionSlug === 'pages' && !hasPublishedDoc && hasEmptyLayout) {
    wasEligible.current = true
  }

  const canChooseTemplate =
    collectionSlug === 'pages' && !hasPublishedDoc && (hasEmptyLayout || wasEligible.current)

  useEffect(() => {
    if (!canChooseTemplate) return

    const controller = new AbortController()

    fetch('/api/page-templates?depth=0&limit=50&sort=title&where[_status][equals]=published', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Templates could not be loaded.')
        return response.json() as Promise<{ docs?: Template[] }>
      })
      .then((result) => setTemplates(result.docs || []))
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Page templates could not be loaded.')
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [canChooseTemplate])

  useEffect(() => () => setTemplateStructureLock(false), [])

  const applyTemplate = useCallback(
    async (template?: Template) => {
      setTemplateStructureLock(Boolean(template) && !canManagePageTemplates)

      const currentData = getData()
      const identity = {
        _status: currentData._status,
        pageTemplate: template?.id || null,
        slug: currentData.slug,
        title: currentData.title,
      }
      const hero = template?.hero ?? template?.snapshot?.hero
      const layout = template?.layout ?? template?.snapshot?.layout
      const meta = template?.meta ?? template?.snapshot?.meta
      const templateContent = template
        ? {
            ...(hero !== undefined ? { hero } : {}),
            ...(layout !== undefined ? { layout } : {}),
            ...(meta !== undefined ? { meta } : {}),
          }
        : undefined

      await reset(templateContent ? { ...templateContent, ...identity } : identity)
      setPageTemplate(template?.id || null, true)
      setModified(true)
      setActiveTemplate(template?.id || 'blank')
      toast.success(template ? `${template.title} applied.` : 'Blank page selected.')
    },
    [canManagePageTemplates, getData, reset, setModified, setPageTemplate],
  )

  if (!canChooseTemplate) return null

  const activeTemplateData = templates.find((template) => template.id === activeTemplate)
  const options = [
    { label: 'Blank page', value: 'blank' },
    ...templates.map((template) => ({ label: template.title, value: String(template.id) })),
  ]

  return (
    <div className="page-template-picker">
      <SelectInput
        description={
          loading
            ? 'Loading templates…'
            : activeTemplateData?.description ||
              'Templates create an editable copy. Changes will only affect this Page.'
        }
        label="Page template"
        name="page-template-select"
        onChange={(option) => {
          const selected = Array.isArray(option) ? option[0] : option
          const template = templates.find((item) => String(item.id) === selected?.value)
          void applyTemplate(template)
        }}
        options={options}
        path="pageTemplatePicker"
        readOnly={loading}
        size="large"
        value={String(activeTemplate)}
      />
    </div>
  )
}
