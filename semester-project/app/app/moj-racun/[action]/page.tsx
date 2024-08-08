import { Metadata } from "next"
import {Error404 } from "../../components/error/errorXYZ"
import Loading from "../../components/Loading/loading"
import dynamic from "next/dynamic"
import {LoginRequired} from "../../components/wrappers"

interface params {
	action: string
}

export var accountSettings = {
	description: 'Postavke korisničkog računa',
	actions: [
		{ text: 'Promjeni lozinku', formName: 'changePasswordForm', thumbnail: '/account-managment/password.png', basePath:'/moj-racun' },
		{ text: 'Promjeni adresu e-pošte', formName: 'changeEmailForm', thumbnail: '/account-managment/mail.png', basePath:'/moj-racun' },
		{ text: 'Promjeni korisničko ime', formName: 'changeUsernameForm', thumbnail: '/account-managment/user.png', basePath:'/moj-racun' },
		{ text: 'Ukloni korisnički račun', formName: 'deleteAccountForm', thumbnail: '/account-managment/delete.png', basePath:'/moj-racun' }
	]
}

export const generateMetadata = async ({ params }: { params: params }): Promise<Metadata> => {
	let title = 'Greška'
	accountSettings.actions.map(
		(item) => {
			if (params.action === item.text.toLowerCase().replaceAll(' ', '-').replaceAll('č', 'c').replaceAll('š', 's')) {
				title = item.text
				return
			}
		}
	)
	return { title: title }
}

export default function SwitchAction({ params }: { params: params }) {
	return (
		<main className="formMain">
			<LoginRequired>
				<DynamicRender params={params} />
			</LoginRequired>
		</main>
	)
}

function DynamicRender({ params }: { params: params }) {
	let ComponentToRender: any = Error404
	const {formName} = accountSettings.actions.find((action)=>action.text.toLowerCase().replaceAll(' ', '-').replaceAll('č', 'c').replaceAll('š', 's') === params.action) || {}
	if(formName) ComponentToRender = dynamic(() => import(`../../components/${formName}`), { ssr: false, loading: () => <Loading message="Učitavanje" /> })
	return (<ComponentToRender />)
}