import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import PasswordChangeForm from '../components/PasswordChangeForm/changepassword'
import React from 'react'
import { getSession } from '../../lib/getSession'
import { redirect } from 'next/navigation'
import BorderedLink from '../components/BorderedLink/button'

export const metadata: Metadata = {
	title: 'Promjena lozinke',
	description: 'Promjena lozinke za prijavu u sustav eKaštela',
}

async function LoginPage() {
	const session = await getSession()
	if (!session) redirect('/')
	return (
		<>
			{session ? <PasswordChangeForm/>
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