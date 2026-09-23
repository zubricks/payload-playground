'use client'

import { Pill, Tabs, Thumbnail } from '@payloadcms/ui'
import React, { useState } from 'react'

export type DashboardContentItem = {
  collection: 'pages' | 'posts'
  formattedDate: string
  href: string
  id: string
  imageAlt?: string
  imageURL?: string
  status: 'draft' | 'published'
  title: string
}

type Props = {
  drafts: DashboardContentItem[]
  recent: DashboardContentItem[]
}

export function RecentContentTabs({ drafts, recent }: Props) {
  const [activeTab, setActiveTab] = useState<'drafts' | 'recent'>('recent')
  const items = activeTab === 'recent' ? recent : drafts

  return (
    <>
      <Tabs
        className="content-studio__tabs"
        onChange={setActiveTab}
        tabs={[
          { label: `Recently updated (${recent.length})`, value: 'recent' },
          { label: `Recent drafts (${drafts.length})`, value: 'drafts' },
        ]}
        value={activeTab}
      />

      {items.length > 0 ? (
        <div className="content-studio__table" role="table" aria-label="Recently updated content">
          <div className="content-studio__table-head" role="row">
            <span role="columnheader">Title</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Updated</span>
          </div>
          {items.map((item) => (
            <a className="content-studio__table-row" href={item.href} key={item.id} role="row">
              <span className="content-studio__title-cell" role="cell">
                <Thumbnail
                  className="content-studio__content-thumbnail"
                  fileSrc={item.imageURL}
                  size="small"
                />
                <strong>{item.title}</strong>
              </span>
              <span className="content-studio__type" role="cell">
                {item.collection === 'posts' ? 'Post' : 'Page'}
              </span>
              <span role="cell">
                <Pill
                  pillStyle={item.status === 'published' ? 'success' : 'warning'}
                  rounded
                  size="small"
                >
                  {item.status === 'published' ? 'Published' : 'Draft'}
                </Pill>
              </span>
              <time role="cell">{item.formattedDate}</time>
            </a>
          ))}
        </div>
      ) : (
        <div className="content-studio__empty content-studio__empty--table">
          <p>{activeTab === 'drafts' ? 'No drafts need your attention.' : 'No content yet.'}</p>
        </div>
      )}
    </>
  )
}
