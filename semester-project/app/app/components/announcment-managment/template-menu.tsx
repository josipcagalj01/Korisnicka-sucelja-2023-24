'use client'

import * as z from 'zod'
import {useForm, UseFormSetValue, Control} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '../../../lib/manage-announcments/add-update-announcment-lib'
import '../services/servicesFormStyle.css'
import { MyBooleanInput2, RadioNumberInput2, NumberRadioInputProps } from './special-inputs'
import { Navigation } from '../form-managment/thumbnail-menu/thumbnail-menu'
import { useState, useContext } from 'react'
import styles from '../form-managment/template-menu/templateMenuStyle.module.css'
import styles2 from '../form-managment/thumbnail-menu/thumbnail-menuStyle.module.css'
import { BorderedButton } from '../BorderedLink/button'
import { ManageAnnouncmentContext } from '../../context/manage-announcment-context'
import { useSession } from 'next-auth/react'

interface templateMenuProps {
	setValue: UseFormSetValue<Form>,
	isLoading: React.Dispatch<React.SetStateAction<boolean>>,
	showMenu : React.Dispatch<React.SetStateAction<boolean>>
}

const schema = z.object({
	useTemplate: z.boolean({required_error: 'Unesite odabir'}),
	template_id: z.number().optional()
})
.refine((data)=>{
	if(data.useTemplate) {
		if(data.template_id) return true
		else return false
	}
	else return true
}, {path: ['template_id'], message: 'Odaberite obrazac koji će poslužiti kao predložak.'})

function ChooseTemplate({control, name, current}: Omit<NumberRadioInputProps, 'control' | 'number_value'> & {control: Control<z.infer<typeof schema>>, current: number}) {
	const [page, setPage] = useState(1)
	const {existingAnnouncments} = useContext(ManageAnnouncmentContext) || {existingAnnouncments: null}
	let totalPages = 1
	if(existingAnnouncments?.length) {
		totalPages = Math.ceil(existingAnnouncments?.length / 12)
	}

	let index = -1
	if(existingAnnouncments) index = existingAnnouncments.map(({id})=>id).indexOf(current)
	
	const reordered = index !== -1 ? [(existingAnnouncments?.[index] || {title: '', id: 0, date: null, category: {name: ''}}), ...(existingAnnouncments?.filter((_,i)=>i!==index) || [])] : (existingAnnouncments || [])

	const offset = (page-1)*12
	let endPosition = offset + 12
	if(endPosition > (existingAnnouncments?.length || 0)) endPosition = existingAnnouncments?.length || 0

	return (
		<div className={styles2.thumbnailMenuFrame + " thumbnailMenuFrame"}>
			<div className={styles.templateMenu + ' thumbnailMenu'}>
				{existingAnnouncments?.length && <Navigation className={styles.navigation} page={page} totalPages={totalPages} setPage={setPage}/>}
				<ul>
					{reordered.slice(offset, endPosition).map((form) => {
						return (
							<li key={form.title} className={'radioInput ' + `${current === form.id ? styles.selected : ''}`}>
								<RadioNumberInput2 name={name} control={control}  number_value={form.id} onClick={()=>setPage(1)}/>
								<div>
									<p className={styles.titleAndCategory}>{form.date?.toLocaleDateString([], {timeZone: 'Europe/Zagreb'})} | {form.category.name}</p>
									<p>{form.title}</p>
								</div>
							</li>
						)}
					)}
				</ul>
				{existingAnnouncments?.length && <Navigation page={page} totalPages={totalPages} setPage={setPage}/>}
			</div>
		</div>
	)
}

export default function TemplateMenu(props: templateMenuProps) {
	const {control, watch, handleSubmit, formState: {errors}, setValue} = useForm<z.infer<typeof schema>>({resolver: zodResolver(schema), defaultValues: {useTemplate: false, template_id: 0}})

	const values = watch()
	const session = useSession()

	async function onSubmit(values: z.infer<typeof schema>) {
		props.isLoading(true)
		if(values.template_id) {
			const response = await fetch('/api/get-announcment-template', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify({id: values.template_id})
			})
			if(response.ok) {
				const {template} = await response.json()
				props.setValue('attach_form', template.form_id ? true : null)
				props.setValue('form_id', template.form_id)
				props.setValue('category_id', template.category_id)
				props.setValue('title', template?.title)
				props.setValue('content', template.content as any)
				props.setValue('thumbnail_setting', template.thumbnail_setting)
				props.setValue('thumbnail_id', template.thumbnail_id)
			}
		}
		props.showMenu(false)
		props.isLoading(false)
	}

	return (
		<form className= {styles.form + ' serviceForm'} onSubmit={handleSubmit(onSubmit)}>
			<section>
				<div className='formSectionContent'>
					<div className='labelAndInputContainer'>
						<label htmlFor='use_template'>Odaberite mogućnosti</label>
						<MyBooleanInput2 falseText='Započni s praznom objavom' trueText='Upotrijebi postojeću kao predložak' reversed={true} control={control} name='useTemplate' onClickFalse={()=>setValue('template_id', 0)}/>
						{errors.useTemplate && <b className='formErrorMessage'>{errors.useTemplate.message}</b>}
					</div>
					{values.useTemplate &&
						<div className='labelAndInputContainer'>
							<label htmlFor='template_id'>Odaberite predložak</label>
							<ChooseTemplate control={control} name='template_id' current={values.template_id || 0}/>
							{errors.template_id && <b className='formErrorMessage'>{errors.template_id.message}</b>}
						</div>
					}
				</div>
			</section>
			<BorderedButton type="submit">Kreni s radom</BorderedButton>
		</form>
	)
}