import type { Payload } from 'payload'

export const getFeaturedPost = async (payload: Payload) => {
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      featured: {
        equals: true,
      },
    },
  })

  return result.docs[0] || null
}
