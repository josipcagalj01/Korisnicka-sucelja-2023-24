import './globals.css'
import favicon from './favicon.ico'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | eKaštela',
    default: ''
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hr">
      <head> <link rel='icon' href={favicon.src} /></head>
      <body>
        {children}
      </body>
    </html>
  )
}
