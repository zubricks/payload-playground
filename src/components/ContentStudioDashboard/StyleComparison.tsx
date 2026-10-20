'use client'

import {
  Button,
  CheckboxInput,
  DialogBody,
  DialogCancel,
  DialogFooter,
  DialogHeader,
  DialogModal,
  Pill,
  Tabs,
  TextInput,
  useModal,
} from '@payloadcms/ui'
import React, { useState } from 'react'

const modalSlug = 'dashboard-v3-v4-style-comparison'

type Example = 'button' | 'controls'

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
    v4: `html {
  --color-bg-brand: #83bf78;
  --color-bg-brand-hover: #68a75f;
  --color-bg-brand-pressed: #4d8848;
  --color-text-onbrand: #fff;
  --button-radius: 0.625rem;
}

html[data-theme='dark'],
html [data-theme='dark'] {
  --color-text-brand: #add6a5;
}

<Button size="large">Create a post</Button>`,
  },
  controls: {
    description:
      'Text and checkbox inputs inherit their size, shape, surface, border, focus, disabled, and error treatment from the same semantic system.',
    takeaway:
      'Instead of repeating selectors for every field implementation and interaction state, define the shared control roles once and let Payload’s form primitives consume them.',
    title: 'Form controls',
    v3: `html[data-theme='light'] .field-type.text input,
html[data-theme='light'] .field-type.email input,
html[data-theme='light'] .field-type.number input,
html[data-theme='light'] .field-type.textarea textarea,
html[data-theme='light'] .react-select .rs__control {
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid #e6ddc9;
  border-radius: 10px;
  background: #faf7ed;
}

/* Hover, focus, error and disabled repeat
   the same implementation selectors. */`,
    v4: `html {
  --field-min-height-medium: 2.5rem;
  --field-padding-inline: 0.875rem;
  --field-border-radius: 0.625rem;
  --color-bg: #faf7ed;
  --color-border: #e6ddc9;
  --color-border-brand: #83bf78;
}

<TextInput path="title" size="medium" />
<CheckboxInput label="Featured" />`,
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
              The dashboard layout is custom, but its controls use Payload’s supported UI
              primitives. Define the shared visual roles once and both Payload components and custom
              views stay in sync.
            </p>

            <section className="style-comparison__impact">
              <header>
                <div>
                  <span className="content-studio__eyebrow">Theme impact</span>
                  <h3>One token set, four native components</h3>
                </div>
                <span>All from @payloadcms/ui</span>
              </header>

              <div className="style-comparison__impact-grid">
                <div className="style-comparison__impact-item">
                  <span>Action</span>
                  <Button margin={false}>Publish</Button>
                </div>

                <div className="style-comparison__impact-item style-comparison__impact-item--field">
                  <span>Field</span>
                  <TextInput
                    htmlAttributes={{ readOnly: true }}
                    path="style-comparison-title"
                    size="medium"
                    value="Autumn campaign"
                  />
                </div>

                <div className="style-comparison__impact-item">
                  <span>Selection</span>
                  <CheckboxInput
                    aria-label="Featured"
                    checked
                    label="Featured"
                    onToggle={() => undefined}
                  />
                </div>

                <div className="style-comparison__impact-item">
                  <span>Status</span>
                  <Pill pillStyle="success" rounded>
                    Ready
                  </Pill>
                </div>
              </div>
            </section>

            <Tabs<Example>
              className="style-comparison__tabs"
              onChange={setActiveExample}
              tabs={[
                { label: 'Primary action', value: 'button' },
                { label: 'Form controls', value: 'controls' },
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
