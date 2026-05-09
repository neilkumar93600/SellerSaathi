'use client'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils/cn'

interface BackgroundOrbsProps {
  className?: string
  variant?: 'default' | 'cta'
}

export function BackgroundOrbs({ className, variant = 'default' }: BackgroundOrbsProps) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('.orb-a', {
          x: 40,
          y: 30,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
        gsap.to('.orb-b', {
          x: -50,
          y: -25,
          duration: 11,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
        gsap.to('.orb-c', {
          x: 30,
          y: -40,
          duration: 13,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })
      return () => mm.revert()
    },
    { scope: wrapRef }
  )

  const isCta = variant === 'cta'

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      <div
        className={cn(
          'orb-a absolute -top-32 -right-20 h-[34rem] w-[34rem] rounded-full blur-3xl will-change-transform',
          isCta ? 'bg-white/20' : 'bg-primary/20'
        )}
      />
      <div
        className={cn(
          'orb-b absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl will-change-transform',
          isCta ? 'bg-white/15' : 'bg-accent/30'
        )}
      />
      <div
        className={cn(
          'orb-c absolute top-1/3 left-1/2 h-[20rem] w-[20rem] rounded-full blur-3xl will-change-transform',
          isCta ? 'bg-white/10' : 'bg-emerald-400/15'
        )}
      />
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}
