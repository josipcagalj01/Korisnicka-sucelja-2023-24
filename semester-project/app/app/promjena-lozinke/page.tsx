import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import Header from '../components/header/page'
import Footer from '../components/footer/page'
import PasswordChangeForm from '../components/PasswordChangeForm/page'
import React from 'react'
import {getSession} from '../../lib/getSession'
import { redirect } from 'next/navigation'
import BorderedLink from '../components/BorderedLink/page'

export const metadata: Metadata = {
  title: 'Promjena lozinke',
  description: 'Promjena lozinke za prijavu u sustav eKaštela',
}

async function LoginPage() {
  const session = await getSession()
    return (
      <>
          
          
          {session ? <PasswordChangeForm session={session}/>
          :
          <>
          <p>Pristup ovoj stranici moguć je samo autoriziranim korisnicima. Da biste pristupili ovoj stranici morate se prvo prijaviti.</p>
            <BorderedLink href='/prijava'>Prijava</BorderedLink>
          </>  
          }
      </>
    );
  }

export default LoginPage;