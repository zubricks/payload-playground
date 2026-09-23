import type { Media, User } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

const richText = (text: string) => ({
  root: {
    type: 'root' as const,
    children: [
      {
        type: 'paragraph' as const,
        children: [
          {
            type: 'text' as const,
            detail: 0,
            format: 0,
            mode: 'normal' as const,
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

export const dashboardPosts = ({
  author,
  images,
}: {
  author: User
  images: Media[]
}): RequiredDataFromCollectionSlug<'posts'>[] => [
  {
    _status: 'draft',
    authors: [author.id],
    content: richText(
      'A practical framework for choosing plants, planning seasonal maintenance, and making every square foot work harder.',
    ),
    createdAt: daysAgo(3),
    heroImage: images[0]?.id,
    meta: {
      image: images[0]?.id,
      title: 'A practical guide to sustainable garden planning',
    },
    slug: 'sustainable-garden-planning-guide',
    title: 'A practical guide to sustainable garden planning',
    updatedAt: daysAgo(1),
  },
  {
    _status: 'draft',
    authors: [author.id],
    content: richText(
      'The experiments, results, and customer conversations that shaped our spring campaign.',
    ),
    createdAt: daysAgo(9),
    heroImage: images[1]?.id,
    meta: {
      description: 'A candid review of the ideas and lessons behind our latest seasonal campaign.',
      title: 'What we learned from our spring campaign',
    },
    slug: 'spring-campaign-lessons',
    title: 'What we learned from our spring campaign',
    updatedAt: daysAgo(4),
  },
  {
    _status: 'draft',
    authors: [author.id],
    content: richText(
      'A look at the people, tools, and small decisions behind a thoughtful studio process.',
    ),
    createdAt: daysAgo(31),
    heroImage: images[2]?.id,
    meta: {
      description: 'Meet the team and see how a project moves from an early idea to launch day.',
      image: images[2]?.id,
      title: 'Behind the scenes at Northstar Studio',
    },
    slug: 'behind-the-scenes-northstar-studio',
    title: 'Behind the scenes at Northstar Studio',
    updatedAt: daysAgo(21),
  },
  {
    _status: 'published',
    authors: [author.id],
    content: richText(
      'Five approachable changes that make digital experiences clearer, faster, and more welcoming.',
    ),
    createdAt: daysAgo(7),
    heroImage: images[0]?.id,
    meta: {
      description:
        'Five practical improvements for building clearer and more inclusive digital experiences.',
      image: images[0]?.id,
      title: 'Five small changes that make a website easier to use',
    },
    publishedAt: daysAgo(2),
    slug: 'five-small-website-improvements',
    title: 'Five small changes that make a website easier to use',
    updatedAt: daysAgo(2),
  },
]

export const dashboardPages = ({
  images,
}: {
  images: Media[]
}): RequiredDataFromCollectionSlug<'pages'>[] => [
  {
    _status: 'published',
    createdAt: daysAgo(18),
    hero: { media: images[1]?.id, type: 'mediumImpact' },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            richText: richText('Strategy, design, and delivery for ambitious teams.'),
            size: 'full',
          },
        ],
      },
    ],
    meta: {
      description: 'Explore strategy, design, and content services from Northstar Studio.',
      image: images[1]?.id,
      title: 'Services from Northstar Studio',
    },
    publishedAt: daysAgo(15),
    slug: 'services',
    title: 'Services',
    updatedAt: daysAgo(5),
  },
  {
    _status: 'draft',
    createdAt: daysAgo(12),
    hero: { media: images[2]?.id, type: 'lowImpact' },
    layout: [
      {
        blockType: 'content',
        columns: [
          { richText: richText('A small team that cares deeply about useful work.'), size: 'full' },
        ],
      },
    ],
    meta: { title: 'About Northstar Studio' },
    slug: 'about-our-studio',
    title: 'About our studio',
    updatedAt: daysAgo(6),
  },
  {
    _status: 'draft',
    createdAt: daysAgo(28),
    hero: { type: 'none' },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            richText: richText('Guides, templates, and practical tools for creative teams.'),
            size: 'full',
          },
        ],
      },
    ],
    slug: 'resource-library',
    title: 'Resource library',
    updatedAt: daysAgo(17),
  },
]

export const dashboardFormSubmissions = [
  {
    name: 'Maya Chen',
    email: 'maya@example.com',
    message: 'I would love to discuss a website refresh for our nonprofit.',
    createdAt: daysAgo(0),
  },
  {
    name: 'Jon Bell',
    email: 'jon@example.com',
    message: 'Can you share more about your content strategy process?',
    createdAt: daysAgo(1),
  },
  {
    name: 'Priya Shah',
    email: 'priya@example.com',
    message: 'We are planning a fall campaign and need design support.',
    createdAt: daysAgo(2),
  },
  {
    name: 'Noah Harrington',
    email: 'noah@example.com',
    message: 'Interested in an accessibility review for our product site.',
    createdAt: daysAgo(5),
  },
  {
    name: 'Elijah Carter',
    email: 'elijah@example.com',
    message: 'Could we schedule an introductory call next week?',
    createdAt: daysAgo(9),
  },
]
