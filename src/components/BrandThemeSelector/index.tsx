'use client'

import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import type { RadioFieldClientProps, Validate } from 'payload'
import React from 'react'

import { brandThemes, type BrandTheme } from '@/brandThemes'

import './index.css'

const baseClass = 'brand-theme-selector'

export const BrandThemeSelector: React.FC<RadioFieldClientProps> = ({
  field,
  path,
  readOnly,
  validate,
}) => {
  const { disabled, setValue, showError, value } = useField<BrandTheme>({
    potentiallyStalePath: path,
    validate: validate as Validate,
  })
  const isReadOnly = Boolean(readOnly || disabled)

  return (
    <div className={baseClass}>
      <FieldError path={path} showError={showError} />
      <FieldLabel
        label={field.label}
        localized={field.localized}
        path={path}
        required={field.required}
      />

      <div aria-label="Theme preset" className={`${baseClass}__grid`} role="radiogroup">
        {brandThemes.map((theme) => {
          const inputID = `field-${path}-${theme.value}`
          const isSelected = value === theme.value

          return (
            <label
              className={[
                `${baseClass}__option`,
                isSelected && `${baseClass}__option--selected`,
                isReadOnly && `${baseClass}__option--disabled`,
              ]
                .filter(Boolean)
                .join(' ')}
              htmlFor={inputID}
              key={theme.value}
            >
              <input
                checked={isSelected}
                className={`${baseClass}__input`}
                disabled={isReadOnly}
                id={inputID}
                name={path}
                onChange={() => {
                  setValue(theme.value)
                }}
                type="radio"
                value={theme.value}
              />

              <span className={`${baseClass}__preview`}>
                {/* Static theme screenshots are intentionally served as-is inside the Admin. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`${theme.label} homepage preview`} src={theme.previewImage} />
              </span>

              <span className={`${baseClass}__content`}>
                <span className={`${baseClass}__heading`}>
                  <strong>{theme.label}</strong>
                  <span aria-hidden="true" className={`${baseClass}__indicator`} />
                </span>
                <span className={`${baseClass}__description`}>{theme.description}</span>
              </span>
            </label>
          )
        })}
      </div>

      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}

export default BrandThemeSelector
