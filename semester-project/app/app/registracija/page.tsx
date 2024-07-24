import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import SignUpForm from '../components/SignUpForm/signupform'
import React from 'react'
import { getSession } from '../../lib/getSession'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Registracija',
	description: 'Stranica za registraciju u sustav eKaštela',
}

async function SignUpPage() {
	const session = await getSession()
	if (session) redirect('/')
	return (
		<main className='formMain'>
			<SignUpForm />
		</main>
	);
}

export default SignUpPage;