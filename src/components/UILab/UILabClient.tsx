'use client'

import {
  Banner,
  Button,
  Card,
  DatePicker,
  Drawer,
  DrawerToggler,
  Gutter,
  Pill,
  SelectInput,
  TextInput,
} from '@payloadcms/ui'
import React, { type ChangeEvent, useState } from 'react'

import './index.css'

type UILabClientProps = {
  dashboardURL: string
}

export function UILabClient({ dashboardURL }: UILabClientProps) {
  const [projectName, setProjectName] = useState('Autumn campaign')
  const [publishDate, setPublishDate] = useState<Date | undefined>(new Date())
  const [status, setStatus] = useState('review')

  return (
    <Gutter className="ui-lab">
      <header className="ui-lab__header">
        <div>
          <span className="ui-lab__eyebrow">Payload v4 component showcase</span>
          <h1>A UI you can make your own.</h1>
          <p>
            This view uses Payload components directly and themes them through semantic design
            tokens—without reaching into component internals.
          </p>
        </div>
        <Button buttonStyle="secondary" el="link" margin={false} to={dashboardURL}>
          ← Back to dashboard
        </Button>
      </header>

      <Banner type="brand">
        Every example below uses supported Payload components and semantic design tokens.
      </Banner>

      <div className="ui-lab__grid">
        <section className="ui-lab__section ui-lab__section--form">
          <div className="ui-lab__section-heading">
            <span className="ui-lab__eyebrow">Form primitives</span>
            <h2>Clear, generous inputs</h2>
          </div>

          <TextInput
            description="The v4 TextInput now exposes sizing and uses the shared .form-input primitive."
            label="Project name"
            onChange={(event: ChangeEvent<HTMLInputElement>) => setProjectName(event.target.value)}
            path="ui-lab-project-name"
            size="large"
            value={projectName}
          />

          <SelectInput
            label="Workflow status"
            name="ui-lab-status"
            onChange={(option) => {
              const selected = Array.isArray(option) ? option[0] : option
              setStatus(String(selected?.value || ''))
            }}
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'In review', value: 'review' },
              { label: 'Approved', value: 'approved' },
            ]}
            path="ui-lab-status"
            size="large"
            value={status}
          />

          <div className="ui-lab__date-field">
            <label htmlFor="ui-lab-publish-date">Publish date</label>
            <DatePicker
              id="ui-lab-publish-date"
              onChange={setPublishDate}
              pickerAppearance="dayAndTime"
              placeholder="Choose a publish date"
              value={publishDate}
            />
          </div>
        </section>

        <section className="ui-lab__section">
          <div className="ui-lab__section-heading">
            <span className="ui-lab__eyebrow">Actions and status</span>
            <h2>One system, every state</h2>
          </div>

          <div className="ui-lab__button-grid">
            <Button margin={false}>Primary action</Button>
            <Button buttonStyle="secondary" margin={false}>
              Secondary
            </Button>
            <Button buttonStyle="ghost" margin={false}>
              Ghost
            </Button>
            <Button buttonStyle="dashed" margin={false}>
              Dashed
            </Button>
            <Button buttonStyle="destructive" margin={false}>
              Destructive
            </Button>
            <Button disabled margin={false}>
              Disabled
            </Button>
          </div>

          <div className="ui-lab__pills">
            <Pill pillStyle="success" rounded>
              Published
            </Pill>
            <Pill pillStyle="warning" rounded>
              In review
            </Pill>
            <Pill pillStyle="error" rounded>
              Blocked
            </Pill>
            <Pill pillStyle="light" rounded>
              Draft
            </Pill>
          </div>

          <div className="ui-lab__cards">
            <Card href="/admin/collections/posts" title="Posts" />
            <Card href="/admin/collections/media" title="Media library" />
          </div>

          <DrawerToggler buttonStyle="secondary" slug="ui-lab-drawer">
            Open a Payload drawer
          </DrawerToggler>
          <Drawer slug="ui-lab-drawer" title="Reusable, themed surfaces">
            <div className="ui-lab__drawer-content">
              <span className="ui-lab__eyebrow">Payload Drawer</span>
              <h2>Custom workflows still feel native.</h2>
              <p>
                Drawers, fields, buttons, and feedback inherit the same semantic colors, radii,
                spacing, and type scale as the rest of the Admin UI.
              </p>
            </div>
          </Drawer>
        </section>
      </div>

      <section className="ui-lab__migration">
        <div>
          <span className="ui-lab__migration-version">v3</span>
          <h2>Override implementation details</h2>
          <code>.field-type.text input</code>
          <code>--theme-elevation-800</code>
          <code>base(0.4)</code>
        </div>
        <span className="ui-lab__migration-arrow" aria-hidden="true">
          →
        </span>
        <div>
          <span className="ui-lab__migration-version ui-lab__migration-version--current">v4</span>
          <h2>Theme supported primitives</h2>
          <code>.form-input</code>
          <code>--color-text</code>
          <code>--spacer-2</code>
        </div>
      </section>
    </Gutter>
  )
}
