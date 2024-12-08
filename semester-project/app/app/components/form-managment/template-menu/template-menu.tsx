'use client'

import * as z from 'zod'
import {useForm, UseFormSetValue, Control} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '../../../../lib/configureFormLib'
import '../../services/servicesFormStyle.css'
import { MyBooleanInput2, RadioNumberInput2, NumberRadioInputProps } from '../special-inputs'
import { Navigation } from '../thumbnail-menu/thumbnail-menu'
import { useState, useContext } from 'react'
import styles from './templateMenuStyle.module.css'
import styles2 from '../thumbnail-menu/thumbnail-menuStyle.module.css'
import { BorderedButton } from '../../BorderedLink/button'
import { ManageFormsContext } from '../../../context/manage-forms-context'
import { useSession } from 'next-auth/react'

interface templateMenuProps {
	setValue: UseFormSetValue<Form>,
	isLoading: React.Dispatch<React.SetStateAction<boolean>>,
	showMenu : React.Dispatch<React.SetStateAction<boolean>>
}

const schema = z.object({
	use_template: z.boolean({required_error: 'Unesite odabir'}),
	template_id: z.number().optional()
})
.refine((data)=>{
	if(data.use_template) {
		if(data.template_id) return true
		else return false
	}
	else return true
}, {path: ['template_id'], message: 'Odaberite obrazac koji će poslužiti kao predložak.'})

function ChooseTemplate({control, name, current}: Omit<NumberRadioInputProps, 'control' | 'number_value'> & {control: Control<z.infer<typeof schema>>, current: number}) {
	const [page, setPage] = useState(1)
	const {existingForms} = useContext(ManageFormsContext) || {existingForms: null}
	let totalPages = 1
	if(existingForms?.length) {
		totalPages = Math.ceil(existingForms?.length / 12)
	}

	let index = -1
	if(existingForms) index = existingForms.map(({id})=>id).indexOf(current)
	
	const reordered = index !== -1 ? [(existingForms?.[index] || {title: '', id: 0, avalible_from: null, category: {name: ''}}), ...(existingForms?.filter((_,i)=>i!==index) || [])] : (existingForms || [])

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
								<RadioNumberInput2 name={name} control={control}  number_value={form.id} onClick={()=>setPage(1)}/>
								<div>
									<p className={styles.titleAndCategory}>{form.avalible_from?.toLocaleDateString([], {timeZone: 'Europe/Zagreb'})} | {form.category.name}</p>
									<p>{form.title}</p>
								</div>
							</li>
						)}
					)}
				</ul>
				{existingForms?.length && <Navigation page={page} className={styles.navigation} totalPages={totalPages} setPage={setPage}/>}
			</div>
		</div>
	)
}

export default function TemplateMenu(props: templateMenuProps) {
	const {control, watch, handleSubmit, formState: {errors}, setValue} = useForm<z.infer<typeof schema>>({resolver: zodResolver(schema), defaultValues: {use_template: false, template_id: 0}})

	const values = watch()
	const session = useSession()

	async function onSubmit(values: z.infer<typeof schema>) {
		props.isLoading(true)
		if(values.template_id) {
			const response = await fetch('/api/get-form-template', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify({id: values.template_id})
			})
			if(response.ok) {
				const {template} = await response.json()
				props.setValue('title', template.title)
				props.setValue('fields', template.fields)
				props.setValue('start_time_limited', template.start_time_limited)
				props.setValue('avalible_from', new Date(`${template.avalible_from}`))
				props.setValue('avalible_until', new Date(`${template.avalible_until}`))
				props.setValue('end_time_limited', template.end_time_limited)
				props.setValue('rate_limit', template.rate_limit)
				props.setValue('rate_limit_set', template.rate_limit_set)
				props.setValue('category_id', template.category_id)
				props.setValue('thumbnail_id', template.thumbnail_id || 0)
				props.setValue('thumbnail_setting', template.thumbnail_setting)
				props.setValue('department_id', session.data?.user.role_id === 1 ? template.department_id : session.data?.user.department_id)
			}
		}
		props.showMenu(false)
		props.isLoading(false)
	}

	return (
		<form className={styles.form + ' serviceForm'} onSubmit={handleSubmit(onSubmit)}>
			<section>
				<div className='formSectionContent'>
					<div className='labelAndInputContainer'>
						<label htmlFor='use_template'>Odaberite mogućnosti</label>
						<MyBooleanInput2 falseText='Započni s praznim obrascem' trueText='Upotrijebi postojeći kao predložak' reversed={true} control={control} name='use_template' onClickFalse={()=>setValue('template_id', 0)}/>
						{errors.use_template && <b className='formErrorMessage'>{errors.use_template.message}</b>}
					</div>
					{values.use_template &&
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