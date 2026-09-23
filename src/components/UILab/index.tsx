import { DefaultTemplate } from '@payloadcms/ui/rsc'
import { formatAdminURL } from 'payload/shared'
import type { AdminViewServerProps } from 'payload'
import React from 'react'

import { UILabClient } from './UILabClient'

export function UILab(props: AdminViewServerProps) {
  const { initPageResult, params, payload, searchParams, server, viewActions, viewType } = props
  const { permissions, req } = initPageResult
  const { user } = req
  const dashboardURL = formatAdminURL({ adminRoute: payload.config.routes.admin, path: '/' })

  if (!user) {
    server.redirect(
      formatAdminURL({
        adminRoute: payload.config.routes.admin,
        path: payload.config.admin.routes.login,
      }),
    )
    return null
  }

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={user}
      viewActions={viewActions}
      viewType={viewType}
      visibleEntities={{
        collections: [...initPageResult.visibleEntities.collections],
        globals: [...initPageResult.visibleEntities.globals],
      }}
    >
      <UILabClient dashboardURL={dashboardURL} />
    </DefaultTemplate>
  )
}

export default UILab
