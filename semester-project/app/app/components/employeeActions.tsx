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
	basePath: string,
	basePathOnly?: boolean
}

const employeeActions : Settings = {
	description: 'Što želite učiniti?',
	actions: [
		{text: 'Pregled obrazaca', thumbnail: '/employee-actions/add-form.png', formName:'configureForm', basePath: '/obrasci?_page=1&_limit=15', basePathOnly: true},
		{text: 'Pregled prijava', thumbnail: '/employee-actions/check-submissions.png', basePath: '/prijave?_page=1&_limit=15', basePathOnly: true},
		{text: 'Pregled objava', thumbnail:'/employee-actions/write-article.png', basePath: '/objave?_page=1&_limit=15', basePathOnly: true}
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