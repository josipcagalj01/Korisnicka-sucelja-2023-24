import { Metadata } from "next"
import {Error404 } from "../../components/error/errorXYZ"
import Loading from "../../components/Loading/loading"
import dynamic from "next/dynamic"
import AccountSettingsWrapper from "../../components/accountSettingsWrapper"

interface params {
	action: string
}

export var actions = [
	{ text: 'Promjeni lozinku', formName: 'changePasswordForm', actionThumbnail: '/password.png' },
	{ text: 'Promjeni adresu e-pošte', formName: 'changeEmailForm', actionThumbnail: '/big_mail_image.png' },
	{ text: 'Promjeni korisničko ime', formName: 'changeUsernameForm', actionThumbnail: '/pngwing.com.png' },
	{ text: ' Brisanje korisničkog računa', formName: 'deleteAccountForm', actionThumbnail: '/trashcan.png' }
]

export const generateMetadata = async ({ params }: { params: params }): Promise<Metadata> => {
	let title = 'Greška'
	actions.map(
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
			<AccountSettingsWrapper>
				<DynamicRender params={params} />
			</AccountSettingsWrapper>
		</main>
	)
}

function DynamicRender({ params }: { params: params }) {
	let ComponentToRender: any = Error404
	const {formName} = actions.find((action)=>action.text.toLowerCase().replaceAll(' ', '-').replaceAll('č', 'c').replaceAll('š', 's') === params.action) || {}
	if(formName) ComponentToRender = dynamic(() => import(`../../components/${formName}`), { ssr: false, loading: () => <Loading message="Učitavanje" /> })
	return (<ComponentToRender />)
}