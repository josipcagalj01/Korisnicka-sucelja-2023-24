import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import Header from '../components/header/page'

export const metadata: Metadata = {
  title: 'Prijavi se - eKaštela',
  description: 'Prijava u sustav eKaštela',
}

function LoginPage() {
    return (
      <body className={inter.className}>
        <Header currentPage="Prijava" />
        <div className="flex justify-center">
          <h1>Ovo je stranica za registraciju i prijavu u sustav.</h1>
        </div>
      </body>
    );
  }

  export default LoginPage;