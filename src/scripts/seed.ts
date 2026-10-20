import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'

import { seed } from '@/endpoints/seed'

const payload = await getPayload({ config })

try {
  const req = await createPayloadRequest({ payload })

  await seed({ payload, req })
} finally {
  await payload.destroy()
}
