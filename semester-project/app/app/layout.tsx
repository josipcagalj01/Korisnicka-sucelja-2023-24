import './globals.css'
import favicon from './favicon.ico'
import type { Metadata } from 'next'
import AuthProvider from './context/AuthProvider'
import Footer from './components/footer/page'
import Header from './components/header/page'
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
      <head><link rel='icon' href={favicon.src}/></head>
      <body>
        <AuthProvider>
          <Header />
        </AuthProvider>
        {children}
        <AuthProvider>
          <Footer/>
        </AuthProvider>
      </body>
    </html>
  )
}
