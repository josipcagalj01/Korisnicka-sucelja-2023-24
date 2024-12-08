'use client'
import { Form } from "../../../lib/manage-announcments/add-update-announcment-lib"
import { Control } from "react-hook-form"
import { useState, useContext } from "react"
import styles from '../form-managment/template-menu/templateMenuStyle.module.css'
import styles2 from '../form-managment/thumbnail-menu/thumbnail-menuStyle.module.css'
import { RadioNumberInput } from "./special-inputs"
import { ManageAnnouncmentContext } from "../../context/manage-announcment-context"
import { Navigation } from "../form-managment/thumbnail-menu/thumbnail-menu"

export default function PickFormToAttach({control, current, category_id, department_id}: {control: Control<Form>, current: number, category_id:number, department_id: number}) {
	const [page, setPage] = useState(1)
	const {existingForms} = useContext(ManageAnnouncmentContext) || {thumbnails: []}
	const formstoDisplay = existingForms?.filter((a)=>a.category.id===category_id && a.department_id===department_id)
	const totalPages = formstoDisplay?.length ? Math.ceil(formstoDisplay.length / 12) : 1

	let index = -1
	if(formstoDisplay) index = formstoDisplay?.map(({id})=>id).indexOf(current)
	const reordered = index !== -1 ? [(formstoDisplay?.[index] || {title: '', id: 0, category: {name: ''}, avalible_from: null, department_id:0}), ...(formstoDisplay?.filter((_,i)=>i!==index) || [])] : (formstoDisplay || [])

	const offset = (page-1)*12
	let endPosition = offset + 12
	if(endPosition > (existingForms?.length || 0)) endPosition = existingForms?.length || 0

	return (
		<div className={styles2.thumbnailMenuFrame + " thumbnailMenuFrame"}>
			<div className={styles.templateMenu + ' thumbnailMenu'}>
				{existingForms?.length && <Navigation className={styles.navigation} page={page} totalPages={totalPages} setPage={setPage}/>}
				<ul>
					{reordered.slice(offset, endPosition).map((form) => {
						return (
							<li key={form.title} className={'radioInput ' + `${current === form.id ? styles.selected : ''}`}>
								<RadioNumberInput name={'form_id'} control={control}  number_value={form.id} onClick={()=>setPage(1)}/>
								<div>
									<p className={styles.titleAndCategory}>{form.avalible_from?.toLocaleDateString([], {timeZone: 'Europe/Zagreb'})} | {form.category.name}</p>
									<p>{form.title}</p>
								</div>
							</li>
						)}
					)}
				</ul>
				{existingForms?.length && <Navigation page={page} totalPages={totalPages} setPage={setPage}/>}
			</div>
		</div>
	)
}