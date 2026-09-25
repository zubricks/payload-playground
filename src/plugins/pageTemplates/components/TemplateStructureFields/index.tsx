'use client'

import type {
  ArrayFieldClientComponent,
  BlocksFieldClientComponent,
  CheckboxFieldClientComponent,
  RadioFieldClientComponent,
  SelectFieldClientComponent,
} from 'payload'
import {
  ArrayField,
  BlocksField,
  CheckboxField,
  RadioGroupField,
  SelectField,
  useFormFields,
} from '@payloadcms/ui'
import React from 'react'

import { useTemplateStructureLock } from '../../templateStructureLock'
import { useCanManagePageTemplates } from '../../useCanManagePageTemplates'

import './index.scss'

const useIsTemplateStructureLocked = (): boolean => {
  const canManagePageTemplates = useCanManagePageTemplates()
  const pageTemplate = useFormFields(([fields]) => fields.pageTemplate?.value)
  const templateSelectedInPicker = useTemplateStructureLock()

  return !canManagePageTemplates && (Boolean(pageTemplate) || templateSelectedInPicker)
}

export const TemplateLockedSelectField: SelectFieldClientComponent = (props) => {
  const isLocked = useIsTemplateStructureLocked()

  return <SelectField {...props} readOnly={props.readOnly || isLocked} />
}

export const TemplateLockedRadioField: RadioFieldClientComponent = (props) => {
  const isLocked = useIsTemplateStructureLocked()

  return <RadioGroupField {...props} readOnly={props.readOnly || isLocked} />
}

export const TemplateLockedCheckboxField: CheckboxFieldClientComponent = (props) => {
  const isLocked = useIsTemplateStructureLocked()

  return <CheckboxField {...props} readOnly={props.readOnly || isLocked} />
}

export const TemplateLockedArrayField: ArrayFieldClientComponent = (props) => {
  const isLocked = useIsTemplateStructureLocked()
  const rowCount = useFormFields(([fields]) => {
    const fieldState = fields[props.path]

    if (Array.isArray(fieldState?.rows)) return fieldState.rows.length
    if (Array.isArray(fieldState?.value)) return fieldState.value.length
    if (typeof fieldState?.value === 'number') return fieldState.value

    return 0
  })

  if (!isLocked) return <ArrayField {...props} />

  return (
    <div className="template-locked-array">
      <ArrayField
        {...props}
        field={
          {
            ...props.field,
            admin: {
              ...props.field.admin,
              isSortable: false,
            },
            maxRows: rowCount,
          } as typeof props.field
        }
      />
    </div>
  )
}

export const TemplateLockedBlocksField: BlocksFieldClientComponent = (props) => {
  const isLocked = useIsTemplateStructureLocked()
  const rowCount = useFormFields(([fields]) => {
    const fieldState = fields[props.path]

    if (Array.isArray(fieldState?.rows)) return fieldState.rows.length
    if (Array.isArray(fieldState?.value)) return fieldState.value.length
    if (typeof fieldState?.value === 'number') return fieldState.value

    return 0
  })

  if (!isLocked) return <BlocksField {...props} />

  return (
    <div className="template-locked-blocks">
      <p className="template-locked-blocks__notice">
        This Page uses a template structure. You can edit its content, but only a Site Admin can
        change fields that define the template structure.
      </p>
      <BlocksField
        {...props}
        field={
          {
            ...props.field,
            admin: {
              ...props.field.admin,
              isSortable: false,
            },
            maxRows: rowCount,
          } as typeof props.field
        }
      />
    </div>
  )
}
