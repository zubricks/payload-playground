'use client'

import { TextInput, useField } from '@payloadcms/ui'
import type { TextFieldClientProps, Validate } from 'payload'
import React, { type ChangeEvent } from 'react'

import './index.css'

const getSlugPreview = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const HeadlineWorkbench: React.FC<TextFieldClientProps> = ({
  field,
  path,
  readOnly,
  validate,
}) => {
  const {
    setValue,
    showError,
    value = '',
  } = useField<string>({
    potentiallyStalePath: path,
    validate: validate as Validate,
  })

  const characterCount = value.length
  const isIdealLength = characterCount >= 40 && characterCount <= 60
  const slugPreview = getSlugPreview(value) || 'your-page-title'

  return (
    <div className="headline-workbench">
      <TextInput
        description={field.admin?.description}
        htmlAttributes={{ autoComplete: field.admin?.autoComplete }}
        label={field.label}
        localized={field.localized}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
        path={path}
        placeholder={field.admin?.placeholder || 'Give this content a clear, useful title'}
        readOnly={readOnly}
        required={field.required}
        showError={showError}
        size="large"
        value={value}
      />

      <div className="headline-workbench__meta" aria-live="polite">
        <span className={isIdealLength ? 'is-ideal' : undefined}>
          {characterCount}/90 characters
        </span>
        <span>{isIdealLength ? 'Ideal headline length' : 'Aim for 40–60 characters'}</span>
      </div>

      <div className="headline-workbench__preview">
        <span className="headline-workbench__eyebrow">Search preview</span>
        <strong>{value || 'Your page title will appear here'}</strong>
        <span className="headline-workbench__url">northstar.example/{slugPreview}</span>
      </div>
    </div>
  )
}

export default HeadlineWorkbench
