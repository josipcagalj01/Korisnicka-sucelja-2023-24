import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import SignInForm from '../components/SignInForm/signinform'
import React from 'react'
import {getSession} from '../../lib/getSession'
import { redirect } from 'next/navigation'
import AuthProvider from '../context/AuthProvider'
export const metadata: Metadata = {
  title: 'Prijava',
  description: 'Stranica za prijavu u sustav eKaštela',
}

async function LoginPage() {
	const session = await getSession()
	if (session) redirect('/')
	return (
		<>
			<SignInForm/>
		</>
	);
}

export default LoginPage;