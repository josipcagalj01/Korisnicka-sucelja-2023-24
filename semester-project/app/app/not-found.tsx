import {getSession} from '../lib/getSession'
import BorderedLink from './components/BorderedLink/button'
import type {Metadata} from 'next'
import './not-foundStyle.css'

export const metadata: Metadata = {
	title: 'Stranicu nije moguće pronaći',
	description: 'Stranica s porukom o nemogućnosti pronalaska tražene stranice informacijskog sustava eKaštela',
}

export default async function NotFound() {
	const session= await getSession();
	return (
		<div className='responsiveContainer'>
			<div className='notFoundMessage'>
				<h1 className='errorCode'>404</h1>
				<h1>Greška</h1>
				<p>Stranicu koju ste namjeravali posjetiti nije moguće pronaći. Možda je uklonjena ili premještena.</p>
				<BorderedLink href='/' className='A'>Povratak na naslovnicu</BorderedLink>
			</div>
			
		</div>
	)
}
