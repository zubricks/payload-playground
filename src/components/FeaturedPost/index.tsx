import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export const FeaturedPost: React.FC<{ post: Post }> = ({ post }) => {
  const { categories, heroImage, meta, slug, title } = post
  const featuredImage =
    heroImage && typeof heroImage === 'object'
      ? heroImage
      : meta?.image && typeof meta.image === 'object'
        ? meta.image
        : null

  if (!slug) return null

  return (
    <section aria-labelledby="featured-post-title" className="featured-post container">
      <article className="featured-post__card">
        <Link className="featured-post__link" href={`/posts/${slug}`}>
          {featuredImage ? (
            <Media
              fill
              imgClassName="featured-post__image"
              pictureClassName="featured-post__picture"
              priority
              resource={featuredImage}
              size="(max-width: 768px) 100vw, 1200px"
            />
          ) : null}
          <div aria-hidden="true" className="featured-post__overlay" />
          <div className="featured-post__content">
            <span className="featured-post__eyebrow">Featured post</span>

            {categories && categories.length > 0 ? (
              <div className="featured-post__categories">
                {categories.map((category, index) => {
                  if (typeof category !== 'object') return null

                  return (
                    <Fragment key={category.id || index}>
                      {category.title}
                      {index < categories.length - 1 ? <span> / </span> : null}
                    </Fragment>
                  )
                })}
              </div>
            ) : null}

            <h2 id="featured-post-title">{title}</h2>
            {meta?.description ? <p>{meta.description}</p> : null}
            <span className="featured-post__action">
              Read story
              <ArrowUpRightIcon aria-hidden="true" />
            </span>
          </div>
        </Link>
      </article>
    </section>
  )
}
