'use client'
import { Header } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Header['navItems']>[number]>()

  const itemLabel =
    data?.data?.kind === 'dropdown' ? data?.data?.dropdownLabel : data?.data?.link?.label

  const label = itemLabel
    ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${itemLabel}`
    : 'Row'

  return <div>{label}</div>
}
