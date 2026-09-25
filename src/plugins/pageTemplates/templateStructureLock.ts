'use client'

import { useSyncExternalStore } from 'react'

const lockAttribute = 'data-page-template-structure-locked'
const lockEvent = 'payload:page-template-structure-lock'

const subscribe = (listener: () => void): (() => void) => {
  window.addEventListener(lockEvent, listener)

  return () => window.removeEventListener(lockEvent, listener)
}

const getSnapshot = (): boolean =>
  typeof document !== 'undefined' && document.documentElement.hasAttribute(lockAttribute)

export const setTemplateStructureLock = (isLocked: boolean): void => {
  if (typeof document === 'undefined') return

  const wasLocked = document.documentElement.hasAttribute(lockAttribute)
  if (wasLocked === isLocked) return

  if (isLocked) {
    document.documentElement.setAttribute(lockAttribute, 'true')
  } else {
    document.documentElement.removeAttribute(lockAttribute)
  }

  window.dispatchEvent(new Event(lockEvent))
}

export const useTemplateStructureLock = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, () => false)
