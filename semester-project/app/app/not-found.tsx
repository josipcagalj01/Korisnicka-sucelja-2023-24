import { Error404 } from './components/error/errorXYZ'
import type {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Stranicu nije moguće pronaći',
	description: 'Stranica s porukom o nemogućnosti pronalaska tražene stranice informacijskog sustava eKaštela',
}

export default async function NotFound() {
	return (
		<main>
			<Error404 />
		</main>
	)
}
