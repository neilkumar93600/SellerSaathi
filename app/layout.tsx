import type { Metadata } from 'next'
import { Play, Poppins } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { NextIntlClientProvider } from 'next-intl'
import { Providers } from '@/components/providers'
import './globals.css'

const play = Play({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SellerSaathi — AI Tools for Amazon India & Flipkart Sellers',
    template: '%s | SellerSaathi',
  },
  description:
    'AI-powered listing optimizer and POA generator for Amazon India and Flipkart sellers. Replace ₹10,000/month agencies.',
  keywords: [
    'amazon india listing optimizer',
    'flipkart seller tools',
    'seller saathi',
    'amazon seo india',
    'flipkart listing seo',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'SellerSaathi',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${play.variable} ${poppins.variable}`}
    >
      <body>
        <ThemeProvider>
          <NextIntlClientProvider>
            <Providers>{children}</Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
