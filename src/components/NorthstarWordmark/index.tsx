import { cn } from '@/utilities/ui'
import React from 'react'

export function NorthstarWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('northstar-wordmark', className)}>
      <svg aria-hidden="true" viewBox="0 0 32 32">
        <path d="M16 1.75 19.25 12.75 30.25 16 19.25 19.25 16 30.25 12.75 19.25 1.75 16 12.75 12.75 16 1.75Z" />
        <circle cx="16" cy="16" r="2.4" />
      </svg>
      <span>Northstar</span>
    </span>
  )
}
