'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/utilities/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.css'

import { getClientSideURL } from '@/utilities/getURL'

const baseClass = 'admin-bar'

const adminBarLinkStyle: React.CSSProperties = {
  color: 'inherit',
  display: 'block',
  overflow: 'hidden',
  textDecoration: 'none',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
  projects: {
    plural: 'Projects',
    singular: 'Project',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div
      className={cn(baseClass, {
        block: show,
        hidden: !show,
      })}
      style={{
        background: '#000',
        boxSizing: 'border-box',
        color: '#fff',
        minHeight: '44px',
        paddingBlock: '12px',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="admin-bar__inner"
          classNames={{
            controls: 'admin-bar__controls',
            create: 'admin-bar__action',
            edit: 'admin-bar__action',
            logo: 'admin-bar__logo',
            logout: 'admin-bar__logout',
            preview: 'admin-bar__preview',
            user: 'admin-bar__user',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          logo={<Title />}
          logoProps={{
            style: {
              ...adminBarLinkStyle,
              flexShrink: 0,
              marginRight: '12px',
            },
          }}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          createProps={{ style: adminBarLinkStyle }}
          divProps={{
            style: {
              alignItems: 'center',
              display: 'flex',
              flex: '1 1 auto',
              gap: '12px',
              justifyContent: 'flex-end',
              marginRight: '12px',
              minWidth: 0,
            },
          }}
          editProps={{ style: adminBarLinkStyle }}
          logoutProps={{ style: adminBarLinkStyle }}
          unstyled
          style={{
            alignItems: 'center',
            color: '#fff',
            display: 'flex',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
            fontSize: '13px',
            lineHeight: '20px',
            minHeight: '20px',
            minWidth: 0,
            position: 'relative',
            width: '100%',
          }}
          userProps={{
            style: {
              ...adminBarLinkStyle,
              marginRight: '12px',
              minWidth: '48px',
            },
          }}
        />
      </div>
    </div>
  )
}
