import { Metadata } from "next"
import {Error404 } from "../../components/error/errorXYZ"
import Loading from "../../components/Loading/loading"
import dynamic from "next/dynamic"
import {LoginRequired} from "../../components/wrappers"
import { transformStr } from "../../../lib/otherFunctions"
import { Settings } from "../../components/employeeActions"

interface params {
	action: string
}

export var accountSettings: Settings = {
	description: 'Postavke korisničkog računa',
	actions: [
		{ text: 'Promijeni lozinku', formName: 'changePasswordForm', thumbnail: '/account-managment/password.png', basePath:'/moj-racun' },
		{ text: 'Promijeni adresu e-pošte', formName: 'changeEmailForm', thumbnail: '/account-managment/mail.png', basePath:'/moj-racun' },
		{ text: 'Promijeni korisničko ime', formName: 'changeUsernameForm', thumbnail: '/account-managment/user.png', basePath:'/moj-racun' },
		{ text: 'Ukloni korisnički račun', formName: 'deleteAccountForm', thumbnail: '/account-managment/delete.png', basePath:'/moj-racun' }
	]
}

export var myActivities : Settings = {
	description: 'Moje e-usluge',
	actions : [
		{text: 'Novi zahtjev', thumbnail: '/citizen-actions/submit.png', basePath: '/usluge', basePathOnly: true, query: '?_page=1&_limit=15'},
		{text: 'Povijest zahtjeva', thumbnail: '/citizen-actions/submissions-history.png', basePath: '/moj-racun', query: '?_page=1&_limit=15'}
	]
}

export const generateMetadata = async ({ params }: { params: params }): Promise<Metadata> => {
	let title = 'Greška'
	accountSettings.actions.concat(myActivities.actions).map(
		(item) => {
			if (params.action === transformStr(item.text)) {
				title = item.text
				return
			}
		}
	)
	return { title: title }
}

export default function SwitchAction({ params, searchParams }: { params: params, searchParams: Record<string, string | string[] | undefined>; }) {
	return (
		<main className="formMain">
			<LoginRequired>
				<DynamicRender params={params} searchParams={searchParams}/>
			</LoginRequired>
		</main>
	)
}

function DynamicRender({ params, searchParams }: { params: params, searchParams: Record<string, string | string[] | undefined>; }) {
	let ComponentToRender: any = Error404
	const knownAction = accountSettings.actions.some((action)=>transformStr(action.text) === params.action) || myActivities.actions.some((action)=>transformStr(action.text) === params.action)
	if(knownAction) ComponentToRender = dynamic(() => import(`../../components/manage-my-account/${params.action}`), { ssr: true, loading: () => <Loading message="Učitavanje" /> })
	return (<ComponentToRender searchParams={searchParams}/>)
}