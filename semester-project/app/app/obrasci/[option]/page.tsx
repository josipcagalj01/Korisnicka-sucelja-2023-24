import { Metadata } from "next"
import { Error404 } from "../../components/error/errorXYZ"
import { EmployeesOnly, ParticularDepartmentOnly } from "../../components/wrappers"
import { Suspense } from "react"
import Loading from "../../components/Loading/loading"
import ConfigureForm from "../../components/form-managment/add-form"
import UpdateForm from "../../components/form-managment/update-form"
import { getCategories, getDepartments, getFormConfigurationForEmployee, getForms2, getFormTemplate, getThumbnails } from "../../../lib/db_qurery_functions"
import AddFormContext from "../../context/manage-forms-context"
import BorderedLink from "../../components/BorderedLink/button"
import { Params } from "../../../lib/interfaces"
import styles from '../editableFormsStyle.module.css'

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

export default function ManageForms({params, searchParams}: {params: Params, searchParams: Record<string, string | string[] | undefined>}) {
	return (
		<main className="_80ch">
			<Suspense fallback={<Loading message="Učitavanje" />}>
				<Render params={params} searchParams={searchParams}/>
			</Suspense>
		</main>
	)
}

async function Render({params, searchParams}: {params: Params, searchParams: Record<string, string | string[] | undefined>}) {
	const thumbnails = await getThumbnails()
	const {categories} = await getCategories()
	const departments = await getDepartments()

	if(params.option==='dodaj-novi-obrazac') {
		let existingForm = undefined
		const {_templateid} = searchParams
		if(_templateid) {
			const id = parseInt(_templateid as string)
			if(!isNaN(id)) existingForm = await getFormTemplate(id)
		}
		const forms = await getForms2()
		return (
			<EmployeesOnly>
				<h1>Dodavanje novog obrasca</h1>
				<AddFormContext existingForms={forms || []} categories={categories || []} departments={departments || []} thumbnails={thumbnails || []}>
					<ConfigureForm configuration={existingForm || undefined}/>
				</AddFormContext>
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
					<h1 className={styles.h1}>Pretpregled obrasca</h1>
					<h2>{form.title}</h2>
					<div className={styles.buttons}>
						<BorderedLink href={'/obrasci/dodaj-novi-obrazac?_templateid='+id}>Koristi ovaj obrazac kao predložak</BorderedLink>
						<BorderedLink href={'/prijave/' + id + '?_page=1&_limit=15'}>Pregledaj prijave</BorderedLink>
					</div>
					<AddFormContext thumbnails={thumbnails || []} categories={categories || []} departments={departments || []}>
						<UpdateForm form={form} recordsExist={recordsExist}/>
					</AddFormContext>
				</ParticularDepartmentOnly>
			)
		}
	}
}