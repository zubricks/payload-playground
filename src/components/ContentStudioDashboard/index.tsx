import { Button, Pill, Thumbnail } from '@payloadcms/ui'
import type { WidgetServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import React from 'react'

import type { Form, FormSubmission, Media, Page, Post } from '@/payload-types'
import { SeedButton } from '@/components/BeforeDashboard/SeedButton'

import { RecentContentTabs, type DashboardContentItem } from './RecentContentTabs'
import { StyleComparison } from './StyleComparison'

import './index.css'

type ContentItem = {
  collection: 'pages' | 'posts'
  id: string
  imageAlt?: string
  imageURL?: string
  publishedAt?: null | string
  status: 'draft' | 'published'
  title: string
  updatedAt: string
}

const formatDate = (date: string, locale?: null | string) =>
  new Intl.DateTimeFormat(locale || 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))

const hasMissingSEO = (doc: Page | Post) => !doc.meta?.title || !doc.meta?.description

const getMedia = (value: Media | null | string | undefined) =>
  value && typeof value === 'object' ? value : undefined

const toContentItem = (collection: ContentItem['collection'], doc: Page | Post): ContentItem => {
  const media =
    collection === 'posts' ? getMedia((doc as Post).heroImage) : getMedia((doc as Page).hero?.media)

  return {
    collection,
    id: doc.id,
    imageAlt: media?.alt || doc.title,
    imageURL: media?.thumbnailURL || media?.url || undefined,
    publishedAt: doc.publishedAt,
    status: doc._status === 'published' ? 'published' : 'draft',
    title: doc.title,
    updatedAt: doc.updatedAt,
  }
}

export function StudioWelcomeWidget({ req }: WidgetServerProps) {
  const { payload, user } = req

  if (!user) return null

  const now = new Date()
  const adminRoute = payload.config.routes.admin
  const firstName = typeof user.name === 'string' ? user.name.split(' ')[0] : 'there'
  const uiLabURL = formatAdminURL({ adminRoute, path: '/ui-lab' })

  return (
    <header className="content-studio__hero">
      <div className="content-studio__hero-copy">
        <span className="content-studio__eyebrow">Northstar content studio</span>
        <h1>
          Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {firstName}.
        </h1>
        <p>Your publishing queue, site health, and newest assets—all in one place.</p>
      </div>
      <div className="content-studio__hero-actions">
        <StyleComparison />
        <Button buttonStyle="secondary" el="link" margin={false} size="large" to={uiLabURL}>
          Explore UI Lab
        </Button>
        <SeedButton
          label="Seed demo content"
          size="large"
          tooltip="Replace the current demo content with the complete starter dataset"
        />
      </div>
    </header>
  )
}

export async function ContentOverviewWidget({ req }: WidgetServerProps) {
  const { payload, user } = req

  if (!user) return null

  const adminRoute = payload.config.routes.admin
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const commonAccess = {
    overrideAccess: false as const,
    user,
  }

  const [recentPosts, recentPages, media, draftPosts, draftPages, publishedPosts, publishedPages] =
    await Promise.all([
      payload.find({
        ...commonAccess,
        collection: 'posts',
        depth: 0,
        draft: true,
        limit: 12,
        sort: '-updatedAt',
      }),
      payload.find({
        ...commonAccess,
        collection: 'pages',
        depth: 0,
        draft: true,
        limit: 12,
        sort: '-updatedAt',
      }),
      payload.count({ ...commonAccess, collection: 'media' }),
      payload.count({
        ...commonAccess,
        collection: 'posts',
        where: { _status: { equals: 'draft' } },
      }),
      payload.count({
        ...commonAccess,
        collection: 'pages',
        where: { _status: { equals: 'draft' } },
      }),
      payload.count({
        ...commonAccess,
        collection: 'posts',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { publishedAt: { greater_than_equal: startOfMonth } },
          ],
        },
      }),
      payload.count({
        ...commonAccess,
        collection: 'pages',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { publishedAt: { greater_than_equal: startOfMonth } },
          ],
        },
      }),
    ])

  const contentNeedingAttention = [
    ...(recentPosts.docs as Post[]),
    ...(recentPages.docs as Page[]),
  ].filter((doc) => hasMissingSEO(doc) || doc._status === 'draft')

  const postsURL = formatAdminURL({ adminRoute, path: '/collections/posts' })
  const pagesURL = formatAdminURL({ adminRoute, path: '/collections/pages' })
  const mediaURL = formatAdminURL({ adminRoute, path: '/collections/media' })
  const metrics = [
    {
      detail: 'Posts and pages published since the first of the month',
      href: postsURL,
      label: 'Published this month',
      value: publishedPosts.totalDocs + publishedPages.totalDocs,
    },
    {
      detail: 'Content that is still being written or reviewed',
      href: postsURL,
      label: 'Drafts in progress',
      value: draftPosts.totalDocs + draftPages.totalDocs,
    },
    {
      detail: 'Recent content missing SEO details or still in draft',
      href: pagesURL,
      label: 'Needs attention',
      value: contentNeedingAttention.length,
    },
    {
      detail: 'Reusable images, video, and documents in the library',
      href: mediaURL,
      label: 'Media assets',
      value: media.totalDocs,
    },
  ]

  return (
    <section className="content-studio__metrics" aria-label="Content overview">
      {metrics.map((metric) => (
        <a className="content-studio__metric" href={metric.href} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </a>
      ))}
    </section>
  )
}

export async function RecentContentWidget({ req }: WidgetServerProps) {
  const { payload, user } = req

  if (!user) return null

  const adminRoute = payload.config.routes.admin
  const commonAccess = {
    overrideAccess: false as const,
    user,
  }
  const [recentPosts, recentPages, draftPosts, draftPages] = await Promise.all([
    payload.find({
      ...commonAccess,
      collection: 'posts',
      depth: 1,
      draft: true,
      limit: 8,
      sort: '-updatedAt',
    }),
    payload.find({
      ...commonAccess,
      collection: 'pages',
      depth: 1,
      draft: true,
      limit: 8,
      sort: '-updatedAt',
    }),
    payload.find({
      ...commonAccess,
      collection: 'posts',
      depth: 1,
      draft: true,
      limit: 8,
      sort: '-updatedAt',
      where: { _status: { equals: 'draft' } },
    }),
    payload.find({
      ...commonAccess,
      collection: 'pages',
      depth: 1,
      draft: true,
      limit: 8,
      sort: '-updatedAt',
      where: { _status: { equals: 'draft' } },
    }),
  ])
  const postsURL = formatAdminURL({ adminRoute, path: '/collections/posts' })
  const toDashboardItem = (item: ContentItem): DashboardContentItem => ({
    collection: item.collection,
    formattedDate: formatDate(item.updatedAt, req.locale),
    href: `${formatAdminURL({ adminRoute, path: `/collections/${item.collection}` })}/${item.id}`,
    id: `${item.collection}-${item.id}`,
    imageAlt: item.imageAlt,
    imageURL: item.imageURL,
    status: item.status,
    title: item.title,
  })
  const mergeContent = (posts: Post[], pages: Page[]) =>
    [
      ...posts.map((doc) => toContentItem('posts', doc)),
      ...pages.map((doc) => toContentItem('pages', doc)),
    ]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 7)
      .map(toDashboardItem)

  const recentContent = mergeContent(recentPosts.docs as Post[], recentPages.docs as Page[])
  const recentDrafts = mergeContent(draftPosts.docs as Post[], draftPages.docs as Page[])

  return (
    <section className="content-studio__panel content-studio__panel--work-queue">
      <div className="content-studio__panel-header">
        <div>
          <span className="content-studio__eyebrow">Work queue</span>
          <h2>Recently updated</h2>
        </div>
        <Button buttonStyle="ghost" el="link" margin={false} to={postsURL}>
          View all content
        </Button>
      </div>

      <RecentContentTabs drafts={recentDrafts} recent={recentContent} />
    </section>
  )
}

export async function RecentMediaWidget({ req }: WidgetServerProps) {
  const { payload, user } = req

  if (!user) return null

  const adminRoute = payload.config.routes.admin
  const mediaURL = formatAdminURL({ adminRoute, path: '/collections/media' })
  const recentMedia = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 6,
    overrideAccess: false,
    sort: '-updatedAt',
    user,
  })

  return (
    <section className="content-studio__panel content-studio__panel--media">
      <div className="content-studio__panel-header">
        <div>
          <span className="content-studio__eyebrow">Asset library</span>
          <h2>Recently added</h2>
        </div>
      </div>

      <div className="content-studio__assets">
        {(recentMedia.docs as Media[]).map((asset) => (
          <a className="content-studio__asset" href={`${mediaURL}/${asset.id}`} key={asset.id}>
            <Thumbnail
              className="content-studio__asset-thumbnail"
              fileSrc={asset.thumbnailURL || asset.url || undefined}
              size="medium"
            />
            <span>
              <strong>{asset.alt || asset.filename || 'Untitled asset'}</strong>
              <small>{asset.mimeType?.replace('image/', '').toUpperCase() || 'Media'}</small>
            </span>
          </a>
        ))}
        {recentMedia.docs.length === 0 && (
          <div className="content-studio__empty content-studio__empty--compact">
            <p>No assets have been uploaded yet.</p>
          </div>
        )}
      </div>

      <Button buttonStyle="secondary" el="link" margin={false} to={mediaURL}>
        Browse media library
      </Button>
    </section>
  )
}

export async function EditorialFocusWidget({ req }: WidgetServerProps) {
  const { payload, user } = req

  if (!user) return null

  const adminRoute = payload.config.routes.admin
  const commonAccess = {
    overrideAccess: false as const,
    user,
  }
  const [posts, pages] = await Promise.all([
    payload.find({
      ...commonAccess,
      collection: 'posts',
      depth: 0,
      draft: true,
      limit: 20,
      sort: '-updatedAt',
      where: { _status: { equals: 'draft' } },
    }),
    payload.find({
      ...commonAccess,
      collection: 'pages',
      depth: 0,
      draft: true,
      limit: 20,
      sort: '-updatedAt',
      where: { _status: { equals: 'draft' } },
    }),
  ])
  const staleThreshold = Date.now() - 1000 * 60 * 60 * 24 * 14
  const focusItems = [
    ...(posts.docs as Post[]).map((doc) => toContentItem('posts', doc)),
    ...(pages.docs as Page[]).map((doc) => toContentItem('pages', doc)),
  ]
    .map((item) => {
      const source =
        item.collection === 'posts'
          ? (posts.docs as Post[]).find((doc) => doc.id === item.id)
          : (pages.docs as Page[]).find((doc) => doc.id === item.id)
      const isStale = new Date(item.updatedAt).getTime() < staleThreshold
      const reason = !source?.meta?.description
        ? 'Add a meta description'
        : !source?.meta?.image
          ? 'Choose a social image'
          : isStale
            ? 'Revisit this older draft'
            : 'Continue editing'
      const priority = !source?.meta?.description ? 3 : !source?.meta?.image ? 2 : isStale ? 1 : 0

      return { ...item, priority, reason }
    })
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5)
  const postsURL = formatAdminURL({ adminRoute, path: '/collections/posts' })

  return (
    <section className="content-studio__panel content-studio__panel--focus">
      <div className="content-studio__panel-header">
        <div>
          <span className="content-studio__eyebrow">Next best actions</span>
          <h2>Editorial focus</h2>
        </div>
        <Pill pillStyle={focusItems.length > 0 ? 'warning' : 'success'} rounded>
          {focusItems.length > 0 ? `${focusItems.length} to review` : 'All clear'}
        </Pill>
      </div>

      {focusItems.length > 0 ? (
        <div className="content-studio__focus-list">
          {focusItems.map((item, index) => (
            <a
              className="content-studio__focus-item"
              href={`${formatAdminURL({ adminRoute, path: `/collections/${item.collection}` })}/${item.id}`}
              key={`${item.collection}-${item.id}`}
            >
              <span className="content-studio__focus-number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.reason}</small>
              </span>
              <Pill pillStyle="light" rounded size="small">
                {item.collection === 'posts' ? 'Post' : 'Page'}
              </Pill>
            </a>
          ))}
        </div>
      ) : (
        <div className="content-studio__empty content-studio__empty--compact">
          <p>No drafts need attention right now.</p>
          <Button el="link" margin={false} to={`${postsURL}/create`}>
            Start something new
          </Button>
        </div>
      )}
    </section>
  )
}

export async function FormsInboxWidget({ req }: WidgetServerProps) {
  const { payload, user } = req

  if (!user) return null

  const adminRoute = payload.config.routes.admin
  const submissionsURL = formatAdminURL({ adminRoute, path: '/collections/form-submissions' })
  const weekAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  const commonAccess = {
    overrideAccess: false as const,
    user,
  }
  const [submissions, recentCount] = await Promise.all([
    payload.find({
      ...commonAccess,
      collection: 'form-submissions',
      depth: 1,
      limit: 6,
      sort: '-createdAt',
    }),
    payload.count({
      ...commonAccess,
      collection: 'form-submissions',
      where: { createdAt: { greater_than_equal: weekAgo } },
    }),
  ])

  const getSubmissionValue = (submission: FormSubmission, names: string[]) => {
    const match = submission.submissionData?.find((item) =>
      names.some((name) => item.field.toLowerCase().includes(name)),
    )
    return match?.value
  }

  return (
    <section className="content-studio__panel content-studio__panel--inbox">
      <div className="content-studio__panel-header">
        <div>
          <span className="content-studio__eyebrow">Lead capture</span>
          <h2>Forms inbox</h2>
        </div>
        <Pill pillStyle={recentCount.totalDocs > 0 ? 'success' : 'light'} rounded>
          {recentCount.totalDocs} this week
        </Pill>
      </div>

      {submissions.docs.length > 0 ? (
        <div className="content-studio__inbox-list">
          {(submissions.docs as FormSubmission[]).map((submission) => {
            const form = typeof submission.form === 'object' ? (submission.form as Form) : undefined
            const sender =
              getSubmissionValue(submission, ['name']) ||
              getSubmissionValue(submission, ['email']) ||
              'Anonymous submission'
            const detail =
              getSubmissionValue(submission, ['message', 'subject', 'company']) ||
              `Submitted via ${form?.title || 'form'}`

            return (
              <a
                className="content-studio__inbox-item"
                href={`${submissionsURL}/${submission.id}`}
                key={submission.id}
              >
                <span className="content-studio__inbox-avatar" aria-hidden="true">
                  {sender.charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong>{sender}</strong>
                  <small>{detail}</small>
                </span>
                <time dateTime={submission.createdAt}>
                  {formatDate(submission.createdAt, req.locale)}
                </time>
              </a>
            )
          })}
        </div>
      ) : (
        <div className="content-studio__empty content-studio__empty--compact">
          <p>New form submissions will appear here.</p>
        </div>
      )}

      <Button buttonStyle="ghost" el="link" margin={false} to={submissionsURL}>
        View all submissions
      </Button>
    </section>
  )
}

export async function SEOHealthWidget({ req }: WidgetServerProps) {
  const { payload, user } = req

  if (!user) return null

  const commonAccess = {
    overrideAccess: false as const,
    user,
  }
  const [posts, pages] = await Promise.all([
    payload.find({ ...commonAccess, collection: 'posts', depth: 0, draft: true, limit: 100 }),
    payload.find({ ...commonAccess, collection: 'pages', depth: 0, draft: true, limit: 100 }),
  ])
  const docs = [...(posts.docs as Post[]), ...(pages.docs as Page[])]
  const issues = [
    {
      count: docs.filter((doc) => !doc.meta?.description).length,
      label: 'Missing meta description',
    },
    { count: docs.filter((doc) => !doc.meta?.image).length, label: 'Missing social image' },
    { count: docs.filter((doc) => !doc.meta?.title).length, label: 'Missing meta title' },
    {
      count: docs.filter((doc) => (doc.meta?.title?.length || 0) > 60).length,
      label: 'Title over 60 characters',
    },
  ]
  const possibleChecks = docs.length * issues.length
  const issueCount = issues.reduce((total, issue) => total + issue.count, 0)
  const score =
    possibleChecks > 0 ? Math.round(((possibleChecks - issueCount) / possibleChecks) * 100) : 100
  const pagesURL = formatAdminURL({
    adminRoute: payload.config.routes.admin,
    path: '/collections/pages',
  })

  return (
    <section className="content-studio__panel content-studio__panel--seo">
      <div className="content-studio__panel-header">
        <div>
          <span className="content-studio__eyebrow">Search readiness</span>
          <h2>SEO health</h2>
        </div>
        <Pill pillStyle={issueCount > 0 ? 'warning' : 'success'} rounded>
          {issueCount > 0 ? `${issueCount} need attention` : 'Looking good'}
        </Pill>
      </div>

      <div className="content-studio__score">
        <strong>{score}%</strong>
        <span>{docs.length} documents checked</span>
      </div>
      <div className="content-studio__progress" aria-label={`SEO score ${score}%`}>
        <span style={{ width: `${score}%` }} />
      </div>
      <div className="content-studio__issues">
        {issues.map((issue) => (
          <a href={pagesURL} key={issue.label}>
            <span>{issue.label}</span>
            <strong>{issue.count}</strong>
          </a>
        ))}
      </div>
    </section>
  )
}

export async function CollectionShortcutsWidget({ req }: WidgetServerProps) {
  const { payload, user } = req

  if (!user) return null

  const commonAccess = {
    overrideAccess: false as const,
    user,
  }
  const [pages, posts, media, categories] = await Promise.all([
    payload.count({ ...commonAccess, collection: 'pages' }),
    payload.count({ ...commonAccess, collection: 'posts' }),
    payload.count({ ...commonAccess, collection: 'media' }),
    payload.count({ ...commonAccess, collection: 'categories' }),
  ])
  const adminRoute = payload.config.routes.admin
  const shortcuts = [
    { count: pages.totalDocs, label: 'Pages', slug: 'pages' },
    { count: posts.totalDocs, label: 'Posts', slug: 'posts' },
    { count: media.totalDocs, label: 'Media', slug: 'media' },
    { count: categories.totalDocs, label: 'Categories', slug: 'categories' },
  ]

  return (
    <section className="content-studio__panel content-studio__panel--collections">
      <div className="content-studio__panel-header">
        <div>
          <span className="content-studio__eyebrow">Quick access</span>
          <h2>Collections</h2>
        </div>
      </div>
      <div className="content-studio__collections">
        {shortcuts.map((shortcut) => (
          <a
            href={formatAdminURL({ adminRoute, path: `/collections/${shortcut.slug}` })}
            key={shortcut.slug}
          >
            <span>{shortcut.label}</span>
            <strong>{shortcut.count}</strong>
          </a>
        ))}
      </div>
    </section>
  )
}
