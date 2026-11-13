import { readFile } from 'node:fs/promises'
import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

import type { Folder, Media, User } from '@/payload-types'

// Parents precede children so each branch can be created through the Local API.
export const hierarchyFolders = [
  {
    key: 'archives',
    name: 'Archives & Records',
    description: 'Research, exhibition histories, and institutional memory.',
  },
  {
    key: 'records',
    name: 'Exhibition records',
    parent: 'archives',
    description: 'Documentation organised by exhibition year.',
  },
  {
    key: 'records-2026',
    name: '2026',
    parent: 'records',
    description: 'Installation photographs, research notes, and exhibition records for 2026.',
  },
  {
    key: 'conservation',
    name: 'Conservation',
    description: 'Care, research, and documentation of the collection.',
  },
  {
    key: 'paper',
    name: 'Works on paper',
    parent: 'conservation',
    description: 'Paper conservation studies and studio reference material.',
  },
  {
    key: 'exhibitions',
    name: 'Exhibitions',
    description: 'A shared home for exhibition pages, editorial stories, and photography.',
  },
  {
    key: 'quiet',
    name: 'The Quiet Spectrum',
    parent: 'exhibitions',
    description: 'A fictional exhibition exploring colour, light, and the spaces between them.',
  },
  {
    key: 'material',
    name: 'Material Memory',
    parent: 'exhibitions',
    description: 'Objects, gestures, and the stories held in everyday materials.',
  },
  {
    key: 'sky',
    name: 'Open Sky',
    parent: 'exhibitions',
    description: 'Architecture, daylight, and the experience of looking up.',
  },
  {
    key: 'collection',
    name: 'Permanent Collection',
    description: 'Selected works, collection stories, and reference photography.',
  },
  {
    key: 'modern',
    name: 'Modern & Contemporary',
    parent: 'collection',
    description: 'Colour, abstraction, and contemporary approaches to making.',
  },
  {
    key: 'sculpture',
    name: 'Sculpture & Objects',
    parent: 'collection',
    description: 'An empty branch ready for a live create-and-move demonstration.',
  },
  {
    key: 'programs',
    name: 'Public Programs',
    description: 'Ways to meet, make, and explore the museum together.',
  },
  {
    key: 'workshops',
    name: 'Studio workshops',
    parent: 'programs',
    description: 'Hands-on sessions connecting exhibitions with creative practice.',
  },
  {
    key: 'talks',
    name: 'Artist talks',
    parent: 'programs',
    description: 'A place to demonstrate creating and organising a new program.',
  },
] as const

type FolderKey = (typeof hierarchyFolders)[number]['key']
type DemoSection = {
  folder: FolderKey
  slug: string
  title: string
  introduction: string
  detail: string
  media: string[]
  posts: { title: string; slug: string; text: string; draft?: boolean }[]
}

export const hierarchySections: DemoSection[] = [
  {
    folder: 'quiet',
    slug: 'the-quiet-spectrum',
    title: 'Ana Voss: The Quiet Spectrum',
    introduction:
      'Step into an exhibition where light becomes material and colour changes the way a room feels.',
    detail:
      'The Quiet Spectrum brings luminous installations, architectural studies, and colour experiments into conversation. Move slowly through the galleries: a reflection, an opening in the ceiling, or a shift in daylight can change the work. This fictional exhibition is illustrated with reference photography, not documentation of works by Ana Voss.',
    media: [
      'quiet-spectrum-neon',
      'quiet-spectrum-light',
      'quiet-spectrum-gallery',
      'quiet-spectrum-skylight',
      'quiet-spectrum-concrete',
      'quiet-spectrum-colour',
      'quiet-spectrum-pigment',
      'quiet-spectrum-portrait',
    ],
    posts: [
      {
        title: 'Inside look: The Quiet Spectrum',
        slug: 'quiet-spectrum-inside-look',
        text: 'Before the doors open, the team walks through the exhibition to consider sightlines, reflections, and the visitor journey. Discover how a sequence of spaces creates moments of energy and stillness.',
      },
      {
        title: 'The Quiet Spectrum — Opening reception',
        slug: 'quiet-spectrum-opening-reception',
        text: 'Join an evening of conversation and close looking as we open The Quiet Spectrum. Meet the exhibition team, explore the galleries, and discover the ideas behind the season.',
      },
      {
        title: 'The Quiet Spectrum — Closing reflections',
        slug: 'quiet-spectrum-closing-reflections',
        text: 'As the exhibition draws to a close, we gather observations from visitors and the curatorial team. This working draft will become a record of how people experienced light, colour, and shared space.',
        draft: true,
      },
    ],
  },
  {
    folder: 'material',
    slug: 'material-memory',
    title: 'Material Memory',
    introduction: 'Clay, pigment, and paper hold the traces of the hands that shape them.',
    detail:
      'Material Memory follows the life of an object from an early sketch to its place in a gallery. The exhibition considers texture, repetition, and the quiet evidence of making. Reference photographs introduce the materials and processes that underpin this fictional exhibition.',
    media: [
      'material-memory-vessel',
      'material-memory-object',
      'material-memory-paint',
      'material-memory-studio',
    ],
    posts: [
      {
        title: 'Reading the surface: a guide to Material Memory',
        slug: 'material-memory-reading-the-surface',
        text: 'A surface can reveal the pressure of a hand, the movement of a brush, or the heat of a kiln. Our short looking guide offers three ways to notice these details during your visit.',
      },
      {
        title: 'From sketchbook to gallery',
        slug: 'material-memory-sketchbook-to-gallery',
        text: 'An object rarely begins with a finished plan. Follow the experiments, notes, and material tests that help an idea take shape, and see why unfinished studies belong in the exhibition story.',
      },
    ],
  },
  {
    folder: 'sky',
    slug: 'open-sky',
    title: 'Open Sky: Architecture and Light',
    introduction:
      'Look up. A building can frame the sky as carefully as a gallery frames an artwork.',
    detail:
      'Open Sky explores the meeting point of architecture and atmosphere. Atriums, skylights, and passages guide attention through a changing landscape of shadows. The exhibition invites visitors to see the museum itself as part of the experience.',
    media: ['open-sky-atrium', 'open-sky-gallery', 'open-sky-passage', 'open-sky-architecture'],
    posts: [
      {
        title: 'A daylight walk through Open Sky',
        slug: 'open-sky-daylight-walk',
        text: 'Begin in the atrium, pause beneath the skylight, and follow the passage to the upper gallery. This self-guided walk invites you to compare the colour and direction of light across the building.',
      },
      {
        title: 'Designing a room around the sky',
        slug: 'open-sky-designing-around-the-sky',
        text: 'A conversation about how openings, materials, and proportions shape our experience of a room. The editorial team is preparing this story alongside the exhibition research.',
        draft: true,
      },
    ],
  },
  {
    folder: 'modern',
    slug: 'collection-in-colour',
    title: 'The Collection in Colour',
    introduction:
      'Discover connections across the permanent collection through colour, gesture, and form.',
    detail:
      'This selection brings paintings and gallery studies together as starting points for close looking. Compare a dense field of marks with a quiet area of colour. Notice how framing and placement change the way an image is read.',
    media: [
      'collection-colour-study',
      'collection-wall-study',
      'collection-form-study',
      'collection-sculpture-hall',
    ],
    posts: [
      {
        title: 'Three ways to look at an abstract painting',
        slug: 'collection-three-ways-to-look',
        text: 'Start with the whole image, move closer to one detail, and then step back again. These simple changes in distance reveal relationships between colour, texture, and the movement of a mark.',
      },
      {
        title: 'A new conversation in the collection galleries',
        slug: 'collection-new-conversation',
        text: 'Rehanging a gallery can bring familiar works into a new conversation. Our team considers the connections that emerge when a painting, an object, and an architectural view share a space.',
      },
    ],
  },
  {
    folder: 'records-2026',
    slug: 'inside-the-archive',
    title: 'Inside the Archive',
    introduction:
      'Exhibition records preserve the decisions, research, and conversations behind each season.',
    detail:
      'Browse a working archive of reading-room photographs and research material. The 2026 branch sits three levels deep so editors can practise following breadcrumbs, moving documents, and keeping related content together as a collection grows.',
    media: [
      'archive-reading-room',
      'archive-bookshelves',
      'archive-card-index',
      'archive-study-notes',
    ],
    posts: [
      {
        title: 'What belongs in an exhibition archive?',
        slug: 'archive-what-belongs',
        text: 'A useful archive includes more than the final catalogue. Research notes, installation records, captions, and visitor guides help future teams understand how an exhibition came together.',
      },
    ],
  },
  {
    folder: 'workshops',
    slug: 'studio-workshops',
    title: 'Make Space: Studio Workshops',
    introduction:
      'Try an idea with your hands. Our studio sessions turn close looking into creative practice.',
    detail:
      'Begin with a short gallery conversation, then experiment with colour, paper, and simple materials in the studio. These fictional programs welcome curious beginners and give families and friends a way to explore the exhibition together.',
    media: ['programs-making', 'programs-workshop'],
    posts: [
      {
        title: 'In the studio: colour and collaboration',
        slug: 'programs-colour-and-collaboration',
        text: 'A shared table is a place to test ideas and learn from one another. Our next studio session combines a gallery visit with a collaborative colour study inspired by the exhibition season.',
      },
    ],
  },
  {
    folder: 'paper',
    slug: 'caring-for-works-on-paper',
    title: 'Caring for Works on Paper',
    introduction:
      'A closer look at the research and patient attention that help fragile works endure.',
    detail:
      'Paper responds to light, handling, and its environment. This introduction explains how documentation and careful observation support conservation decisions. Reference images provide material for a fictional behind-the-scenes story rather than instructions for treating an artwork.',
    media: ['conservation-materials', 'conservation-paper'],
    posts: [
      {
        title: 'Before a work enters the gallery',
        slug: 'conservation-before-the-gallery',
        text: 'Before display, the conservation team reviews the condition record, checks the mount, and considers the environment. This draft follows the documentation that accompanies a work from storage to the gallery.',
        draft: true,
      },
    ],
  },
]

const richText = (...paragraphs: string[]) => ({
  root: {
    type: 'root' as const,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: paragraphs.map((text) => ({
      type: 'paragraph' as const,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      textFormat: 0,
      textStyle: '',
      children: [
        { type: 'text' as const, detail: 0, format: 0, mode: 'normal' as const, style: '', text, version: 1 },
      ],
    })),
  },
})

// This trusted seed only adds missing fixtures; reruns preserve existing documents and edits.
export async function seedHierarchyDemo({
  payload,
  req,
  author,
}: {
  payload: Payload
  req: PayloadRequest
  author?: User
}): Promise<void> {
  const operation = {
    overrideAccess: true as const,
    req,
    depth: 0,
    context: { disableRevalidate: true },
  }
  if (!author) {
    const users = await payload.find({
      ...operation,
      collection: 'users',
      limit: 1,
      sort: 'createdAt',
    })
    author = users.docs[0]
  }
  if (!author) throw new Error('Create the first Admin user before running seed:hierarchy.')

  // Preflight every bundled image before writing anything to the database.
  const photoManifest = JSON.parse(
    await readFile(new URL('./hierarchy-media/manifest.json', import.meta.url), 'utf8'),
  ) as { key: string; alt: string; photo: string }[]
  const assets = new Map(
    await Promise.all(
      photoManifest.map(
        async (photo) =>
          [
            photo.key,
            {
              ...photo,
              buffer: await readFile(
                new URL(`./hierarchy-media/${photo.key}.webp`, import.meta.url),
              ),
            },
          ] as const,
      ),
    ),
  )
  for (const section of hierarchySections) {
    for (const key of section.media) {
      if (!assets.has(key)) throw new Error(`Missing hierarchy photo: ${key}`)
    }
  }

  const folders = new Map<FolderKey, Folder>()
  const created = { folders: 0, media: 0, pages: 0, posts: 0 }
  for (const fixture of hierarchyFolders) {
    const parent = 'parent' in fixture ? folders.get(fixture.parent)?.id : undefined
    const existing = await payload.find({
      ...operation,
      collection: 'folders',
      limit: 1,
      where: {
        and: [
          { name: { equals: fixture.name } },
          parent
            ? { _h_folders: { equals: parent } }
            : { or: [{ _h_folders: { exists: false } }, { _h_folders: { equals: null } }] },
        ],
      },
    })
    let folder = existing.docs[0]
    if (!folder) {
      folder = await payload.create({
        ...operation,
        collection: 'folders',
        data: {
          name: fixture.name,
          description: fixture.description,
          _h_folders: parent,
        },
      })
      created.folders++
    }
    folders.set(fixture.key, folder)
  }

  for (const section of hierarchySections) {
    const folder = folders.get(section.folder)!
    const images: Media[] = []
    for (const key of section.media) {
      const asset = assets.get(key)!
      const filename = `hierarchy-demo-${key}.webp`
      const existing = await payload.find({
        ...operation,
        collection: 'media',
        limit: 1,
        where: { filename: { equals: filename } },
      })
      let image = existing.docs[0]
      if (!image) {
        image = await payload.create({
          ...operation,
          collection: 'media',
          data: {
            alt: asset.alt,
            _h_folders: folder.id,
            caption: richText(
              `Reference photography for the fictional ${section.title} demo. Source: https://images.unsplash.com/photo-${asset.photo}`,
            ),
          },
          file: {
            name: filename,
            data: asset.buffer,
            mimetype: 'image/webp',
            size: asset.buffer.length,
          },
        })
        created.media++
      }
      images.push(image)
    }

    const existingPage = await payload.find({
      ...operation,
      collection: 'pages',
      draft: true,
      limit: 1,
      where: { slug: { equals: section.slug } },
    })
    if (!existingPage.docs[0]) {
      const data: RequiredDataFromCollectionSlug<'pages'> = {
        title: section.title,
        slug: section.slug,
        _h_folders: folder.id,
        _status: 'published',
        hero: {
          type: 'mediumImpact',
          media: images[0].id,
          richText: richText(section.title, section.introduction),
        },
        layout: [
          {
            blockType: 'content',
            columns: [{ size: 'full', richText: richText(section.introduction, section.detail) }],
          },
          ...images
            .slice(1, 3)
            .map((image) => ({ blockType: 'mediaBlock' as const, media: image.id })),
        ],
        meta: { title: section.title, description: section.introduction, image: images[0].id },
      }
      await payload.create({ ...operation, collection: 'pages', data })
      created.pages++
    }

    for (const [index, post] of section.posts.entries()) {
      const existing = await payload.find({
        ...operation,
        collection: 'posts',
        draft: true,
        limit: 1,
        where: { slug: { equals: post.slug } },
      })
      if (existing.docs[0]) continue
      const image = images[index % images.length]
      const data: RequiredDataFromCollectionSlug<'posts'> = {
        title: post.title,
        slug: post.slug,
        _h_folders: folder.id,
        _status: post.draft ? 'draft' : 'published',
        authors: [author.id],
        heroImage: image.id,
        content: richText(post.text, section.detail),
        meta: { title: post.title, description: post.text.slice(0, 155), image: image.id },
      }
      await payload.create({ ...operation, collection: 'posts', draft: Boolean(post.draft), data })
      created.posts++
    }
  }
  payload.logger.info(
    { created },
    'Hierarchy demo ready. Open Folders → Exhibitions → The Quiet Spectrum.',
  )
}
