'use client'

import { Button, toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'

import './index.css'

const SuccessMessage: React.FC = () => (
  <div>
    Database seeded! You can now{' '}
    <a target="_blank" href="/">
      visit your website
    </a>
  </div>
)

type SeedButtonProps = {
  buttonStyle?: 'dashed' | 'ghost' | 'primary' | 'secondary'
  inline?: boolean
  label?: string
  size?: 'large' | 'medium'
  tooltip?: string
}

export const SeedButton: React.FC<SeedButtonProps> = ({
  buttonStyle = 'primary',
  inline = false,
  label = 'Seed your database',
  size = 'medium',
  tooltip,
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const handleClick = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault()

      if (seeded) {
        toast.info('Database already seeded.')
        return
      }
      if (loading) {
        toast.info('Seeding already in progress.')
        return
      }
      setLoading(true)
      setError(null)

      const seedRequest = fetch('/next/seed', { method: 'POST', credentials: 'include' }).then(
        async (response) => {
          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'An error occurred while seeding.')
          }

          return response.json()
        },
      )

      toast.promise(seedRequest, {
        loading: 'Seeding demo content…',
        success: <SuccessMessage />,
        error: 'An error occurred while seeding.',
      })

      try {
        await seedRequest
        setSeeded(true)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    },
    [loading, router, seeded],
  )

  return (
    <span className={inline ? 'seed-button seed-button--inline' : 'seed-button'}>
      <Button
        buttonStyle={buttonStyle}
        disabled={seeded}
        loading={loading}
        margin={false}
        onClick={handleClick}
        size={size}
        tooltip={tooltip}
      >
        {seeded ? 'Demo content ready' : label}
      </Button>
      {error ? <span className="seed-button__error">Could not seed. Try again.</span> : null}
    </span>
  )
}
