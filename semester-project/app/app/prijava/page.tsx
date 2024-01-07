import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import Header from '../components/header/page'
import Footer from '../components/footer/page'
import SignInForm from '../components/SignInForm/page'
import React from 'react'
import {getSession} from '../../lib/getSession'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Prijava',
  description: 'Stranica za prijavu u sustav eKaštela',
}

async function LoginPage() {
  const session = await getSession()
  if(session) redirect('/')
    return (
      <>
          <Header currentPage="Prijava" session={session}/>
          <main>
              <SignInForm/>    
          </main>
          <Footer isLoggedIn={session ? true : false}/>
      </>
    );
  }

  export default LoginPage;