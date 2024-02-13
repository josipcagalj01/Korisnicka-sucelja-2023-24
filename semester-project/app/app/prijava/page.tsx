import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import SignInForm from '../components/SignInForm/signinform'
import React from 'react'
import {getSession} from '../../lib/getSession'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Prijava',
  description: 'Stranica za prijavu u sustav eKaštela',
}

async function LoginPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {

	const {callbackUrl} = searchParams

	const session = await getSession()
	if (session) redirect('/')
	return (
		<>
			<SignInForm callbackUrl={callbackUrl?.toString()}/>
		</>
	);
}

export default LoginPage;