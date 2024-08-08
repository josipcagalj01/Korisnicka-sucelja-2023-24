import { getSession } from "../../lib/getSession"
import SettingsMenu from "./SettingsMenu"

export interface Settings {
	description: string,
	actions : Action[] 
}

interface Action {
	text: string,
	thumbnail:string,
	formName?:string
	basePath: string
}

const employeeActions : Settings = {
	description: 'Što želite učiniti?',
	actions: [
		{text: 'Dodaj novi obrazac', thumbnail: '/employee-actions/add-form.png', formName:'configureForm', basePath: '/obrazac'},
		{text: 'Pregledaj pristigle prijave', thumbnail: '/employee-actions/check-submissions.png', basePath: '/pristigle-prijave'},
		{text: 'Napiši novu objavu', thumbnail:'/employee-actions/write-article.png', basePath: '/objava'}
	]
}

const adminActions : Settings ={
	description: 'Upravljanje sustavom',
	actions: []
}

export default async function EmployeeActions() {
	const session = await getSession()
	
	if(session?.user.role_id!=1) return (
		<>
			<SettingsMenu  menu={employeeActions} />
			{!session?.user.role_id && <SettingsMenu menu={adminActions}/>}
		</>
	)
	else return <></>
}