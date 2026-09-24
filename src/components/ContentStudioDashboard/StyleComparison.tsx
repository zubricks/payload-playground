'use client'

import {
  Button,
  DialogBody,
  DialogCancel,
  DialogFooter,
  DialogHeader,
  DialogModal,
  Pill,
  Tabs,
  useModal,
} from '@payloadcms/ui'
import React, { useState } from 'react'

const modalSlug = 'dashboard-v3-v4-style-comparison'

type Example = 'button' | 'pill'

const examples: Record<
  Example,
  {
    description: string
    takeaway: string
    title: string
    v3: string
    v4: string
  }
> = {
  button: {
    description:
      'The primary action in the welcome widget inherits its brand color, readable text, interaction states, height, and radius from shared roles.',
    takeaway:
      'Change the brand role once and every Payload primary action—including hover, pressed, disabled, and split-button states—stays in sync.',
    title: 'Primary button',
    v3: `html[data-theme='light'] .btn--style-primary {
  --bg-color: #83bf78;
  --color: #fff;
  --hover-bg: #68a75f;
  --hover-color: #fff;
  --btn-border: 1px solid #83bf78;
  --hover-btn-border: 1px solid #68a75f;
}

/* Split and disabled buttons need more rules. */`,
    v4: `html[data-brand-theme='northstar'] {
  --color-bg-brand: #83bf78;
  --color-bg-brand-hover: #68a75f;
  --color-bg-brand-pressed: #4d8848;
  --color-text-onbrand: #fff;
  --button-radius: 0.625rem;
}

html[data-brand-theme='northstar'][data-theme='dark'],
html[data-brand-theme='northstar'] [data-theme='dark'] {
  --color-text-brand: #add6a5;
}

<Button size="large">Create a post</Button>`,
  },
  pill: {
    description:
      'Editorial Focus and Forms Inbox use the same Pill component with supported status variants rather than styling each widget badge independently.',
    takeaway:
      'The widget chooses the meaning—warning or success—while the theme owns the visual treatment and keeps it consistent everywhere.',
    title: 'Status pill',
    v3: `html[data-theme='light'] .pill {
  border-radius: 999px;
  font-size: 12px;
}

html[data-theme='light'] .pill--style-light,
html[data-theme='light'] .pill--style-light-gray,
html[data-theme='light'] .pill--style-white {
  background: #f5f0e3;
  color: var(--theme-elevation-800);
}`,
    v4: `html[data-brand-theme='northstar'][data-theme='light'] {
  --color-bg-warning-tertiary: #fff4cc;
  --color-text-warning: #6f4b00;
  --color-bg-selected: #eef7ea;
  --color-text-brand: #376b35;
}

html[data-brand-theme='northstar'][data-theme='dark'],
html[data-brand-theme='northstar'] [data-theme='dark'] {
  --color-bg-selected: #293d27;
  --color-text-brand: #add6a5;
}

<Pill pillStyle="warning" rounded>
  5 to review
</Pill>`,
  },
}

export function StyleComparison() {
  const [activeExample, setActiveExample] = useState<Example>('button')
  const { openModal } = useModal()
  const example = examples[activeExample]

  return (
    <>
      <Button
        buttonStyle="secondary"
        margin={false}
        onClick={() => openModal(modalSlug)}
        size="large"
        tooltip="See how these dashboard components are styled in Payload v3 and v4"
      >
        Compare v3 → v4
      </Button>

      <DialogModal className="style-comparison" closeOnBlur size="large" slug={modalSlug}>
        <DialogHeader showClose title="Why styling is easier in Payload v4" />
        <DialogBody>
          <div className="style-comparison__content">
            <p className="style-comparison__intro">
              The dashboard layout is custom. The components inside it use Payload’s supported UI
              primitives and semantic design tokens.
            </p>

            <Tabs<Example>
              className="style-comparison__tabs"
              onChange={setActiveExample}
              tabs={[
                { label: 'Primary button', value: 'button' },
                { label: 'Status pill', value: 'pill' },
              ]}
              value={activeExample}
            />

            <section aria-live="polite" className="style-comparison__example">
              <div className="style-comparison__example-copy">
                <div>
                  <span className="content-studio__eyebrow">Live v4 component</span>
                  <h3>{example.title}</h3>
                </div>
                <p>{example.description}</p>
                <div className="style-comparison__preview">
                  {activeExample === 'button' ? (
                    <Button margin={false} size="large">
                      Create a post
                    </Button>
                  ) : (
                    <Pill pillStyle="warning" rounded>
                      5 to review
                    </Pill>
                  )}
                </div>
              </div>

              <div className="style-comparison__code-grid">
                <article className="style-comparison__code-card style-comparison__code-card--v3">
                  <header>
                    <strong>Payload v3</strong>
                    <span>Target implementation classes</span>
                  </header>
                  <pre>
                    <code>{example.v3}</code>
                  </pre>
                </article>

                <article className="style-comparison__code-card style-comparison__code-card--v4">
                  <header>
                    <strong>Payload v4</strong>
                    <span>Set semantic roles + use the component API</span>
                  </header>
                  <pre>
                    <code>{example.v4}</code>
                  </pre>
                </article>
              </div>

              <p className="style-comparison__takeaway">
                <strong>The difference:</strong> {example.takeaway}
              </p>
            </section>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogCancel label="Done" />
        </DialogFooter>
      </DialogModal>
    </>
  )
}
