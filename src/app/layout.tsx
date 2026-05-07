import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import '@/styles/card-states.css'
import '@/styles/data-states.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CS2 Data',
  description: 'CS2 Data Analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`dark ${sora.variable}`}>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
