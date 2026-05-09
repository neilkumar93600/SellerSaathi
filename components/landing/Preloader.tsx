'use client'
import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

interface PreloaderProps {
  onComplete: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<SVGSVGElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const wipeRef = useRef<HTMLDivElement>(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useGSAP(
    () => {
      const finish = () => {
        if (finishedRef.current) return
        finishedRef.current = true
        try {
          sessionStorage.setItem('ss_preloaded', '1')
        } catch {}
        document.body.style.overflow = ''
        onComplete()
      }

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(rootRef.current, { autoAlpha: 0 })
        finish()
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ onComplete: finish })

        const paths = logoRef.current?.querySelectorAll('path')
        if (paths && paths.length > 0) {
          paths.forEach((p) => {
            const len = (p as SVGPathElement).getTotalLength()
            gsap.set(p, {
              strokeDasharray: len,
              strokeDashoffset: len,
              fill: 'transparent',
              stroke: 'oklch(0.7 0.15 160)',
              strokeWidth: 1.5,
            })
          })
          tl.to(paths, {
            strokeDashoffset: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.inOut',
          })
          tl.to(
            paths,
            { fill: 'oklch(0.6 0.18 160)', stroke: 'transparent', duration: 0.3 },
            '-=0.2'
          )
        }

        tl.from(
          logoRef.current,
          { scale: 0.85, duration: 0.4, ease: 'back.out(2)', transformOrigin: 'center' },
          '-=0.4'
        )

        const obj = { val: 0 }
        tl.to(
          obj,
          {
            val: 100,
            duration: 0.9,
            ease: 'power1.inOut',
            onUpdate: () => {
              if (counterRef.current) counterRef.current.textContent = `${Math.round(obj.val)}%`
            },
          },
          0.2
        )

        tl.fromTo(
          wipeRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: 'power2.inOut', transformOrigin: 'left' },
          0.2
        )

        tl.to('.preloader-half-top', {
          yPercent: -100,
          duration: 0.6,
          ease: 'power3.inOut',
        })
        tl.to(
          '.preloader-half-bottom',
          { yPercent: 100, duration: 0.6, ease: 'power3.inOut' },
          '<'
        )
      })

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [] }
  )

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="pointer-events-none fixed inset-0 z-[9999]"
    >
      <div
        className="preloader-half-top absolute inset-x-0 top-0 h-1/2 will-change-transform"
        style={{ background: '#030f09' }}
      />
      <div
        className="preloader-half-bottom absolute inset-x-0 bottom-0 h-1/2 will-change-transform"
        style={{ background: '#030f09' }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            ref={logoRef}
            width="64"
            height="64"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M32 6 C18 6 8 18 8 32 C8 46 18 58 32 58 C46 58 56 46 56 32" />
            <path d="M32 18 L40 26 L34 32 L42 40 L32 50 L22 40 L30 32 L24 26 Z" />
          </svg>
          <span
            ref={counterRef}
            className="font-semibold tabular-nums"
            style={{
              color: 'oklch(0.78 0.16 160)',
              fontFamily: 'var(--font-heading, inherit)',
              fontSize: '1.75rem',
            }}
          >
            0%
          </span>
          <div
            ref={wipeRef}
            className="h-[2px] w-48 will-change-transform"
            style={{ background: 'oklch(0.7 0.18 160)' }}
          />
        </div>
      </div>
    </div>
  )
}
