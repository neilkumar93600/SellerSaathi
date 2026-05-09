'use client'
import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'

interface LanguageSelectProps {
  value: string
  onChange: (lang: string) => void
  className?: string
  ariaLabel?: string
}

export const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', native: 'English' },
  { code: 'hi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'bn', flag: '🇮🇳', native: 'বাংলা' },
  { code: 'ta', flag: '🇮🇳', native: 'தமிழ்' },
  { code: 'te', flag: '🇮🇳', native: 'తెలుగు' },
  { code: 'kn', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
  { code: 'mr', flag: '🇮🇳', native: 'मराठी' },
  { code: 'gu', flag: '🇮🇳', native: 'ગુજરાતી' },
] as const

export function LanguageSelect({ value, onChange, className, ariaLabel }: LanguageSelectProps) {
  const t = useTranslations('common')
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn('h-9 min-w-[140px]', className)}
        aria-label={ariaLabel ?? t('loading')}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden>{lang.flag}</span>
              <span>{lang.native}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
