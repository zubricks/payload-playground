import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'

import { seedHierarchyDemo } from '@/endpoints/seed/hierarchy-demo'

const payload = await getPayload({ config })

try {
  const req = await createPayloadRequest({ payload })
  await seedHierarchyDemo({ payload, req })
} finally {
  await payload.destroy()
}
