import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import Header from '../components/header/page'
import Footer from '../components/footer/page'
import SignUpForm from '../components/signupform/page'
import React from 'react'
import { getSession } from '../lib/getSession'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Registracija',
	description: 'Stranica za registraciju u sustav eKaštela',
}


interface Params {
	action: string;
}

async function SignUpPage() {
	const session = await getSession()
	if (session) redirect('/')
	return (
		<>
			<Header currentPage="Prijava" session={null} />
			<main>
				<SignUpForm />
			</main>
			<Footer isLoggedIn={false} />
		</>
	);
}

export default SignUpPage;