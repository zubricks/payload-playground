import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateBrandTheme: GlobalAfterChangeHook = ({ doc, req: { context, payload } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating brand theme')
    revalidateTag('global_brand-theme', 'max')
  }

  return doc
}
