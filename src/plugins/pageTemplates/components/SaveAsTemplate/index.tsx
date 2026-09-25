'use client'

import { Button, toast, useDocumentInfo } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { useCanManagePageTemplates } from '../../useCanManagePageTemplates'

import './index.scss'

export const SaveAsTemplate: React.FC = () => {
  const canManagePageTemplates = useCanManagePageTemplates()
  const { collectionSlug, data, hasPublishedDoc, id } = useDocumentInfo()
  const [description, setDescription] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (open && !title) {
      setTitle(`${typeof data?.title === 'string' ? data.title : 'Page'} template`)
    }
  }, [data?.title, open, title])

  if (collectionSlug !== 'pages' || !id || !hasPublishedDoc || !canManagePageTemplates) {
    return null
  }

  const saveTemplate = async () => {
    if (!title.trim()) {
      toast.error('Add a name for this template.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/page-templates/capture', {
        body: JSON.stringify({ description, pageId: id, title }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as { message?: string }

      if (!response.ok) throw new Error(result.message || 'The template could not be created.')

      toast.success('Page template created.')
      setDescription('')
      setOpen(false)
      setTitle('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The template could not be created.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button buttonStyle="secondary" margin={false} onClick={() => setOpen(true)} size="medium">
        Save as template
      </Button>

      {open ? (
        <div className="save-page-template" role="presentation">
          <button
            aria-label="Close template dialog"
            className="save-page-template__backdrop"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div aria-labelledby="save-page-template-title" aria-modal="true" role="dialog">
            <span className="save-page-template__eyebrow">Editable copy</span>
            <h2 id="save-page-template-title">Save this page as a template</h2>
            <p>
              The published hero, layout blocks, and SEO fields will become a reusable starting
              point. New pages will not stay linked to this page.
            </p>

            <label>
              Template name
              <input onChange={(event) => setTitle(event.target.value)} value={title} />
            </label>
            <label>
              One-line description
              <textarea
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                value={description}
              />
            </label>

            <div className="save-page-template__actions">
              <Button buttonStyle="secondary" margin={false} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={saving}
                loading={saving}
                margin={false}
                onClick={() => void saveTemplate()}
              >
                Create template
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
