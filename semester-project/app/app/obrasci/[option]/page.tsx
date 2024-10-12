import { Metadata } from "next"
import { Error404 } from "../../components/error/errorXYZ"
import { EmployeesOnly, ParticularDepartmentOnly } from "../../components/wrappers"
import { Suspense } from "react"
import Loading from "../../components/Loading/loading"
import ConfigureForm from "../../components/form-managment/add-form"
import UpdateForm from "../../components/form-managment/update-form"
import { getFormConfigurationForEmployee, getThumbnails } from "../../../lib/db_qurery_functions"

interface Params {
	option: string
}

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
	if(params.option==='dodaj-novi-obrazac') return {title: 'Novi obrazac'}
	else {
		const id = parseInt(params.option)
		if (Number.isNaN(id)) return { title: 'Greška' }
		const {form} = await getFormConfigurationForEmployee(id) || {form: null}
		if (!form) return { title: 'Greška' }
		else return { title: 'Pregled obrasca: ' + form.title}
	}
}

export default function ManageForms({params}: {params: Params}) {
	return (
		<main className="_80ch">
			<Suspense fallback={<Loading message="Učitavanje" />}>
				<Render params={params}/>
			</Suspense>
		</main>
	)
}

async function Render({params}: {params: Params}) {
	const thumbnails = await getThumbnails()

	if(params.option==='dodaj-novi-obrazac') {
		return (
			<EmployeesOnly>
				<h1>Dodavanje novog obrasca</h1>
				<ConfigureForm props={{thumbnails: thumbnails || []}}/>
			</EmployeesOnly>
		)
	}
	else {
		const id = parseInt(params.option)
		if(isNaN(id)) return (<Error404 />)
		const {form, recordsExist} = await getFormConfigurationForEmployee(id) || {form: null, recordsExist: null}
	
		if(!form) return(<Error404 />)
		else {
			return (
				<ParticularDepartmentOnly id={form.department_id}>
					<h1>{form.title}</h1>
					<h2>Pretpregled obrasca</h2>
					<UpdateForm form={form} recordsExist={recordsExist} thumbnails={thumbnails || []}/>
				</ParticularDepartmentOnly>
			)
		}
	}
}