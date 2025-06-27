import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './auth-context'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata: Metadata = {
  title: 'Voca - Car Brand Pronunciation',
  description: 'Learn to pronounce car brand names correctly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="font-jakarta">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 