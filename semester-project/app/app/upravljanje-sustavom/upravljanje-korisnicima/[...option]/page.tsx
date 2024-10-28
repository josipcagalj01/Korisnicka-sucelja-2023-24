import { Metadata } from "next";
import { Error404 } from "../../../components/error/errorXYZ";
import { getSession } from "../../../../lib/getSession";
import { AdminOnly } from "../../../components/wrappers";
import { redirect } from "next/navigation";
import { getUserForForm, getUserForMetadata, getUserToDelete } from "../../../../lib/manage-users/manage-users";
import { getDepartments, getRoles } from "../../../../lib/db_qurery_functions";
import SignUpForm from '../../../components/user-accounts-managment/add-user'
import UpdateUser from '../../../components/user-accounts-managment/update-user'
import DeleteUserForm from "../../../components/user-accounts-managment/delete-user";

interface Params {
	option: string[]
}

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
	if(params.option[0]==='dodaj') return {title: 'Dodavanje novog korisnika'}
	else if(params.option[0]==='ukloni-korisnika') return {title: 'Ukloni korisnika'}
	else {
		const id = parseInt(params.option[0])
		if (Number.isNaN(id)) return { title: 'Greška' }
		const user = await getUserForMetadata(id)
		if (!user) return { title: 'Greška' }
		else return { title: 'Pregled profila: ' + user.name + ' ' + user.surname }
	}
}

export default async function ManageProfile({ params }: { params: Params }) {
	if(params.option[0]==='dodaj') {
		const departments = await getDepartments()
		const roles = await getRoles()
		return (
			<main className="_80ch formMain">
				<AdminOnly>
					<h1>Dodavanje novog korisnika</h1>
					<SignUpForm roles={roles ?? []} departments={departments ?? []}/>
				</AdminOnly>
			</main>
		)
	}
	else if(params.option[0]==='ukloni-korisnika') {
		const session = await getSession()
		const id = parseInt(params.option[1])
		if (Number.isNaN(id)) return <main> <Error404 /> </main>
		else if(session?.user.id===id) redirect('/moj-racun')
		else {
			const user = await getUserToDelete(id)
			if (!user) return <main> <Error404 /> </main>
			else return (
				<main className="_80ch formMain">
					<AdminOnly>
						<h1>Ukloni korisnika <br/> {user.name} {user.surname} ({user.pin})</h1>
						<DeleteUserForm id={user.id}/>
					</AdminOnly>
				</main>
			)
		}
	}
	else {
		const session = await getSession()
		const id = parseInt(params.option[0])
		if (Number.isNaN(id)) return <main> <Error404 /> </main>
		else if(session?.user.id===id) redirect('/moj-racun')
		else {
			const user = await getUserForForm(id)
			const roles = await getRoles()
			const departments = await getDepartments()
			if (!user) return <main> <Error404 /> </main>
			else return (
				<main className="_80ch formMain">
					<AdminOnly>
						<h1>{user.name} {user.surname}</h1>
						<UpdateUser user={user} roles={roles ?? []} departments={departments ?? []}/>
					</AdminOnly>
				</main>
			)
		}
	}
}