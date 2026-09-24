import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { FeaturedPost } from '@/components/FeaturedPost'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { getFeaturedPost } from '@/collections/Posts/getFeaturedPost'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })
  const featuredPost = await getFeaturedPost(payload)

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    ...(featuredPost
      ? {
          where: {
            id: {
              not_equals: featuredPost.id,
            },
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      {featuredPost ? <FeaturedPost post={featuredPost} /> : null}

      <div className="container mt-16 mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
