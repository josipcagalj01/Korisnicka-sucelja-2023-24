'use client'
import { Control, FieldErrors, useFieldArray, useForm, UseFormRegister, UseFormSetValue, useWatch, Controller, UseFieldArrayRemove, UseFormReset } from "react-hook-form";
import '../services/servicesFormStyle.css'
import BorderedLink, { BorderedButton } from "../BorderedLink/button";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect, useContext } from "react";
import Loading from "../Loading/loading";
import ActionResultInfo from "../actionResultInfo/actionResultInfo";
import { useSession } from "next-auth/react";
import {canFieldBeDeleted} from '../../../lib/configureFormLib'
import DeleteIcon from "../delete-icon/delete-icon";
import {
	fileTypes, inputTypes,
	formSchema,
	Form, Field,
	emptyForm, emptyDependency, emptyField
} from '../../../lib/configureFormLib'
import ThumbnailMenu from "./thumbnail-menu/thumbnail-menu";
import FileInput from "./file-input/file-input";
import { upload } from '@vercel/blob/client';
import Image from "next/image";
import { MyBooleanInput, NumberInput, DateInput } from "./special-inputs";
import TemplateMenu from "./template-menu/template-menu";
import { ManageFormsContext } from "../../context/manage-forms-context";


interface nestedFieldProps {
	index:number,
	control:Control<Form>,
	register:UseFormRegister<Form>,
	errors:FieldErrors<Form>,
	fields2:Field[],
	setValue?:UseFormSetValue<Form>,
	dependencyName?:'required' | 'render',
	recordsExist?: boolean
}

export function shouldMoveField(direction: 1 | -1, index: number, fields: Field[]) : boolean {
	if(index===0 && direction === -1) return false
	else if(index === fields.length-1 && direction=== 1) return false
	else {
		if(direction===-1) {
			if(fields[index].render.dependencies.length) {
				if(fields[index].render.dependencies.map(({label})=>label).includes(fields[index + direction].label)) return false
			}
			else if(fields[index].required.dependencies.length) {
				if(fields[index].required.dependencies.map(({label})=>label).includes(fields[index + direction].label)) return false
			}
		}
		else {
			if(fields[index + direction].render.dependencies.length) {
				if(fields[index + direction].render.dependencies.map(({label})=>label).includes(fields[index].label)) return false
			}
			else if(fields[index + direction].required.dependencies.length) {
				if(fields[index + direction].required.dependencies.map(({label})=>label).includes(fields[index].label)) return false
			}
		}
		return true
	}
}

export function moveField(direction: 1 | -1, index: number, form: Form, reset: UseFormReset<Form>) {
	if(shouldMoveField(direction, index,form.fields)) {
		const {fields, ...rest} = form
		let newFields = form.fields
		const tempField = form.fields[index]
		newFields[index] = form.fields[index + direction]
		newFields[index + direction] = tempField

		reset({fields: newFields, ...rest}, {keepDefaultValues: true})		
	}
}

export const optionDeleteWarning = 'Da biste uklonili ili mijenjali ovaj odabir, uklonite kvačice ispred njegovog imena kod određivanja ovisnosti.'
export const fieldDeleteWarning = 'Da biste uklonili ili mijenjali ovo polje, prethodno uklonite ovisnosti povezane s njime.'

function canOptionBeDeleted(fields:Field[], targetedField:Field, targeteOptionIndex:number) : boolean {
	let returnValue = true
	const targetedOption:string = targetedField.options[targeteOptionIndex]?.option || ''
	fields.map(({required, render})=>{
		if(required.dependencies.some(({values,label})=>values.includes(targetedOption) && label===targetedField.label)) {returnValue = false; return}
		else if(render.dependencies.some(({values,label})=>values.includes(targetedOption) && label===targetedField.label)) {returnValue = false; return}
	})	
	return returnValue
}

export function deleteField(form: Form, index:number, reset: UseFormReset<Form>) {
	const {fields, ...rest} = form
	const targetedfield = fields[index]
	let newFields = fields.filter((a)=>a.label!==targetedfield.label)
	newFields.forEach((field, i)=>{
		
			if(field.render.dependencies.map(({label})=>label).includes(targetedfield.label)) {
				const newDependencies = field.render.dependencies.filter((dependency)=>dependency.label!==targetedfield.label)
				newFields[i].render.dependencies =  newDependencies
				const newConditional = newDependencies.length !== 0
				if(field.render.conditional) newFields[i].render.conditional = newConditional
				
				
				if(field.requireIfRendered) {
					newFields[i].requireIfRendered = newConditional
					
					if(field.required.isRequired==='conditional') newFields[i].required.isRequired =  newConditional ? 'conditional' : ''
				}
			}

			if(field.required.dependencies.map(({label})=>label).includes(targetedfield.label)) {
				const newDependencies = field.required.dependencies.filter((dependency)=>dependency.label!==targetedfield.label)
				newFields[i].required.dependencies =  newDependencies
				if(field.required.isRequired==='conditional') newFields[i].required.isRequired =  newDependencies.length!==0 ? 'conditional' : ''
			}
		
	})
	reset({fields: newFields, ...rest}, {keepDefaultValues: true})
}

export default function ConfigureForm(props?: {existingSubmissions?: boolean, configuration?:Omit<Form, 'id'>}) {
	const [showTemplateMenu, shouldShowTemplateMenu] = useState(props?.configuration===undefined)
	const [attemptFailed, setAttemptFailed] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)

	const [showCoreMenu, shouldShowCoreMenu] = useState(true)
	const [showAvalibilityMenu, shouldShowAvalibilityMenu] = useState(true)
	const [showContentMenu, shouldShowContentMenu] = useState(true)
	const [showAppearanceMenu, shouldShowAppearanceMenu] = useState(true)

	const {categories, departments} = useContext(ManageFormsContext) || {categories: null, departments: null}
	
	const session = useSession()

	const {control, formState: {errors}, register, handleSubmit, reset, watch, setValue, getValues } = useForm<Form>({
		resolver: zodResolver(formSchema),
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		defaultValues: emptyForm
	})
	const {fields, append, prepend, remove} = useFieldArray({name:'fields', control})
	
	useEffect(
		() =>{
			isLoading(true)
			if(props?.configuration) {
				setValue('title', props.configuration.title)
				setValue('fields', props.configuration.fields)
				setValue('department_id', session.data?.user.role_id===1 ? props.configuration.department_id : session.data?.user.department_id || 0)
				setValue('start_time_limited', props.configuration.start_time_limited)
				setValue('avalible_from', new Date(`${props.configuration.avalible_from}`))
				setValue('avalible_until', new Date(`${props.configuration.avalible_until}`))
				setValue('end_time_limited', props.configuration.end_time_limited)
				setValue('rate_limit', props.configuration.rate_limit)
				setValue('rate_limit_set', props.configuration.rate_limit_set)
				setValue('category_id', props.configuration.category_id)
				setValue('thumbnail_id', props.configuration.thumbnail_id || 0)
				setValue('thumbnail_setting', props.configuration.thumbnail_setting)
			}
			isLoading(false)
		},
		[props?.configuration]
	)

	const values=watch()
	const fields2 = watch('fields')
	const departmentId = watch('department_id')

	if(values.thumbnail_id===null) setValue('thumbnail_id', 0)

	async function onSubmit(values: Form) {
		isLoading(true)
		setAttemptOccurred(true)
		
		let {fields, avalible_from, avalible_until, thumbnail, thumbnail_setting, thumbnail_id, ...rest} = values
		
		fields.map((field)=>{
			field.required.dependencies.map((conditionalDependency, index)=>{
				const i = field.render.dependencies.map((renderDependency)=>renderDependency.label).indexOf(conditionalDependency.label)
				if(i===-1) field.render.dependencies = [conditionalDependency, ... field.render.dependencies]
				else {
					conditionalDependency.values.map((value)=>{
						const j = field.render.dependencies[i].values.indexOf(value)
						if(j===-1) field.required.dependencies[i].values = [value, ...field.required.dependencies[i].values]
					})
				}
			})
		})

		const response = await fetch('/api/dodaj-obrazac', {
			method: 'POST',
			headers : {'content-type': 'application/json'},
			body: JSON.stringify({
				fields:fields,
				avalible_from: avalible_from ? new Date(avalible_from).toISOString() : '',
				avalible_until: avalible_until ? new Date(avalible_until).toISOString() : '',
				thumbnail_setting: thumbnail_setting === 'existing' ? thumbnail_setting : 'default',
				thumbnail_id: thumbnail_setting === 'new' ? null : thumbnail_id,
				...rest
			})
		})
		
		const {message, newFormId}: {message: string, newFormId: number} = await response.json()
		
		setServerMessage(message)
		if (response.ok) {
			if(thumbnail) {
				try {
					await upload('form-thumbnails/' + values.thumbnail.name, values.thumbnail, {
						access: 'public',
						handleUploadUrl: '/api/upload-thumbnail/' + newFormId,
					});

				} catch(error) {
					setServerMessage(message + 'Dogodio se problem pri pohranu slike na poslužitelj. Možete je pokušati ponovo prenijeti kroz stranicu za upravljanje obrascima')
				}
			}
			reset()
			
		}
		else {
			console.error('Nije moguće dodati novi obrazac.')
			setAttemptFailed(true)
		}
		isLoading(false)
	}
	if(!attemptOccurred && loading) return <Loading message='Inicijalizacija u tijeku...' />
	else if(loading) return <Loading message='Vaš zahtjev se obrađuje. Molim pričekajte...' />
	else if(attemptOccurred) return (
		<div className='afterServiceRequestInfo'>
			<ActionResultInfo ok={!attemptFailed} message={serverMessage} />
			<div>
				<BorderedLink href='/moj-racun'>Povratak osobnu stranicu</BorderedLink>
				<BorderedButton onClick={() => { setAttemptOccurred(!attemptOccurred); setAttemptFailed(false)}}>
					{attemptFailed ? 'Pokušaj ponovo' : 'Novi obrazac'}
				</BorderedButton>
			</div>
		</div>
	)
	else if(showTemplateMenu) return (<TemplateMenu setValue={setValue} isLoading={isLoading} showMenu={shouldShowTemplateMenu}/>)
	else return (
			<form onSubmit={handleSubmit(onSubmit)} className='serviceForm'>
				<div className="border top"></div>
				<div className="formContent">
					<section>
						<div className="titleAndShowHideMenu">
							<button type='button' className={`arrow ${showCoreMenu ? 'opened' : 'closed' }`} onClick={()=>shouldShowCoreMenu(!showCoreMenu)}>
								<Image src='/arrows/show-hide-arrow.png' width={10} height={20} alt='show-hide-arrow'/>
							</button>
							<h2>Osnovne postavke</h2>
						</div>
						<div className={`formSectionContent ${showCoreMenu ? '' : 'displayNone'}`}>
							{session.data?.user.role_id === 1 &&
								<div className="labelAndInputContainer">
									<label htmlFor='departmentId'>Odabere kome su namijenjeni podaci prikupljeni ovim obrascom.</label>
									<select {...register('department_id', { valueAsNumber: true })} value={departmentId}>
										<option disabled value={0} className='displayNone'></option>
										{departments?.map(({ name, id }) => <option key={name} value={id}>{name}</option>)}
									</select>
									{errors.department_id && <b className='formErrorMessage'>{errors.department_id.message}</b>}
								</div>
							}
							<div className="labelAndInputContainer">
								<label htmlFor='category_id'>Odaberite kategoriju novog prijavnog obrasca</label>
								<select {...register('category_id', { valueAsNumber: true })} value={values.category_id}>
									<option disabled value={0} className='displayNone'></option>
									{categories?.map(({ name, id }) => <option key={name} value={id}>{name}</option>)}
								</select>
								{errors.category_id && <b className='formErrorMessage'>{errors.category_id.message}</b>}
							</div>
							<div className="labelAndInputContainer">
								<label htmlFor="title">Unesite naziv prijavnog obrasca</label>
								<input type="text" {...register('title')} />
								{errors.title && <b className='formErrorMessage'>{errors.title.message}</b>}
							</div>
						</div>
					</section>
					<section>
						<div className="titleAndShowHideMenu">
							<button type='button' className={`arrow ${showAvalibilityMenu ? 'opened' : 'closed' }`} onClick={()=>shouldShowAvalibilityMenu(!showAvalibilityMenu)}>
								<Image src='/arrows/show-hide-arrow.png' width={10} height={20} alt='show-hide-arrow'/>
							</button>
							<h2>Postavke dostupnosti</h2>
						</div>
						<div className={`formSectionContent ${showAvalibilityMenu ? '' : 'displayNone'}`}>
							<div className="labelAndInputContainer">
								<label htmlFor="start_time_limited">Hoće li obrazac će postati dostupan od točno određenog trenutka?</label>
								<MyBooleanInput control={control} name = 'start_time_limited'/>
								{errors.start_time_limited && <b className="formErrorMessage">{errors.start_time_limited.message}</b>}
							</div>
							{values.start_time_limited &&
								<div className="labelAndInputContainer">
									<label htmlFor="avalible_from">Odredite od kada će obrazac biti dostupan.</label>
									<DateInput control={control} name="avalible_from"/>
									{errors.avalible_from && <b className="formErrorMessage">{errors.avalible_from.message}</b>}
								</div>
							}
							<div className="labelAndInputContainer">
								<label htmlFor="end_time_limited">Hoće li obrazac prestati biti dostupan u točno određenom trenutku?</label>
								<MyBooleanInput control={control} name='end_time_limited' />
								{errors.end_time_limited && <b className="formErrorMessage">{errors.end_time_limited.message}</b>}
							</div>
							{values.end_time_limited &&
								<div className="labelAndInputContainer">
									<label htmlFor="avalible_until">Odredite do kada će obrazac biti dostupan.</label>
									<DateInput control={control} name="avalible_until" />
									{errors.avalible_until && <b className="formErrorMessage">{errors.avalible_until.message}</b>}
								</div>
							}
							<div className="labelAndInputContainer">
								<label htmlFor="rate_limit_set">Ograniči broj prijava po korisniku</label>
								<MyBooleanInput control={control} name='rate_limit_set' />
							</div>
							{values.rate_limit_set &&
								<div className="labelAndInputContainer">
									<label htmlFor="rate_limit">Odredite koliko najviše puta korisnik može ispuniti obrazac.</label>
									<NumberInput name='rate_limit' control={control}/>
									{errors.rate_limit && <b className="formErrorMessage">{errors.rate_limit.message}</b>}
								</div>
							}
						</div>				
					</section>
					<section>
						<div className="titleAndShowHideMenu">
							<button type='button' className={`arrow ${showContentMenu ? 'opened' : 'closed'}`} onClick={() => shouldShowContentMenu(!showContentMenu)}>
								<Image src='/arrows/show-hide-arrow.png' width={10} height={20} alt='show-hide-arrow' />
							</button>
							<h2>Sadržaj obrasca</h2>
						</div>
						<div className={`formSectionContent ${showContentMenu ? '' : 'displayNone'}`}>
							{!fields2.length && <h3>Još nije dodano ni jedno polje</h3>}
							{fields.map((field, index) => {
								const allowedToDelete = canFieldBeDeleted(fields2, index)
								const inputType = watch(`fields.${index}.inputType`)

								const a = watch(`fields.${index}.render.conditional`)
								if(a===null) setValue(`fields.${index}.render.conditional`, false, {shouldValidate:true})
								
								const b = watch(`fields.${index}.required.isRequired`)
								if(b===null) setValue(`fields.${index}.required.isRequired`, '', {shouldValidate:true})

								const c = watch(`fields.${index}.multiple`)
								if(c===null) setValue(`fields.${index}.multiple`, undefined, {shouldValidate:true})

								return (
									<section className="unnested field" key={index}>
										<div className="fieldSectionHeader">
											<p>Polje br. {index+1}</p>
											<div className='fieldNav'>
												<button className="arrow" disabled={!shouldMoveField(-1, index, fields2)} type='button' onClick={()=>moveField(-1, index, values, reset)}>
													<Image src='/arrows/arrow.png' width={14} height={14} alt='arrow' style={{objectFit:'contain'}}/>
												</button>
												<button className="arrow down" disabled={!shouldMoveField(1, index, fields2)} type='button' onClick={()=>moveField(1, index, values, reset)}>
													<Image src='/arrows/arrow.png' width={14} height={14} alt='arrow' style={{objectFit:'contain'}}/>
												</button>
												<DeleteIcon className={`deleteicon`} onClick={()=>deleteField(values, index, reset)}/>
											</div>
											
										</div>
										<div className='fieldProperties'>
										{!allowedToDelete && <b className='warningMessage'>{fieldDeleteWarning}</b>}
											<div className="labelAndInputContainer">
												<label htmlFor="name">Naziv polja</label>
												{allowedToDelete ? <input type='text' {...register(`fields.${index}.label`)} /> : <p className="fakeInput">{fields2[index].label}</p>}
												{errors.fields?.[index]?.label && <b className="formErrorMessage">{errors.fields[index]?.label?.message}</b>}
											</div>
											<div className="labelAndInputContainer radioInputsContainer">
												<label htmlFor='render'>Kada će se polje prikazivati?</label>
												<MyBooleanInput 
													control={control}
													reversed={true}
													name={`fields.${index}.render.conditional`}
													trueText="Uvjetno" falseText="Uvijek"
													disableTrue={!(index != 0 && fields2.some((field) => field.label != fields2[index].label && ['checkbox', 'radio'].includes(field.inputType)))}
													onClickFalse={()=>{
														setValue(`fields.${index}.render.statisfyAll`, false)
														setValue(`fields.${index}.render.dependencies`, [])
														if(fields2[index].required.isRequired==='conditional') setValue(`fields.${index}.required.isRequired`, '')
													}}
												/>
												{errors.fields?.[index]?.render?.conditional && <b className='formErrorMessage'>{errors.fields[index]?.render?.conditional?.message}</b>}
											</div>
											{fields2[index].render.conditional && <ConditionalDependencyForm index={index} control={control} register={register} errors={errors} fields2={fields2} dependencyName="render" setValue={setValue}/>}
											{!fields2[index].requireIfRendered &&
												<>
													<div className="labelAndInputContainer radioInputsContainer">
														<label htmlFor='required'>Je li polje obvezno?</label>
														<div>
															<span>
																<input type='radio' {...register(`fields.${index}.required.isRequired`)} value='yes' onClick={() => setValue(`fields.${index}.required.dependencies`, [])} />
																<p>Da</p>
															</span>
															<span>
																<input type='radio' {...register(`fields.${index}.required.isRequired`)} value='no' onClick={() => setValue(`fields.${index}.required.dependencies`, [])} />
																<p>Ne</p>
															</span>
															<span className={(index != 0 && fields2.some((field) => field.label != fields2[index].label && ['checkbox', 'radio'].includes(field.inputType))) ? '' : 'disabled'}>
																<input type='radio' {...register(`fields.${index}.required.isRequired`)} value='conditional' />
																<p>Uvjetno</p>
															</span>
														</div>
														{errors.fields?.[index]?.required?.isRequired && <b className='formErrorMessage'>{errors.fields[index]?.required?.isRequired?.message}</b>}
													</div>
													{fields2[index].required.isRequired === 'conditional' && <ConditionalDependencyForm index={index} control={control} register={register} errors={errors} fields2={fields2} />}
												</>
											}
											<div className="labelAndInputContainer">
												<label htmlFor='inputType'>Vrsta unosa</label>
												<select {...register(`fields.${index}.inputType`)}>
													{inputTypes.map(({ type, toDisplay }) => <option key={toDisplay} value={type}>{toDisplay}</option>)}
												</select>
												{errors.fields?.[index]?.inputType && <b className="formErrorMessage">{errors.fields?.[index]?.inputType?.message || ''}</b>}
											</div>
											{['checkbox', 'radio'].includes(inputType) && <NestedField index={index} control={control} register={register} errors={errors} fields2={fields2} setValue={setValue} />}
											{inputType === 'file' &&
												<>
													<div className="labelAndInputContainer nested">
														<label htmlFor='fileTypes'>Odaberite dozvoljene vrste datoteka</label>
														<div className='checkboxContainer'>
															{fileTypes.map(({ name, type }) => <span key={name}><input type='checkbox' {...register(`fields.${index}.fileTypes`)} value={type} /><p>{name}</p></span>)}
														</div>
														{errors.fields?.[index]?.fileTypes && <b className="formErrorMessage">{errors.fields?.[index]?.fileTypes?.message || ''}</b>}
													</div>
													<div className="labelAndInputContainer nested radioInputsContainer">
														<label htmlFor='fileTypes'>Koliko datoteka je moguće priložiti?</label>
														<MyBooleanInput falseText="Jednu" trueText="Više" name={`fields.${index}.multiple`} control={control} reversed={true}/>
														{errors.fields?.[index]?.multiple && <b className="formErrorMessage">{errors.fields?.[index]?.multiple?.message}</b>}
													</div>
												</>
											}
										</div>
										
										{false && allowedToDelete && <DeleteIcon className={`${!allowedToDelete ? 'disabled' : ''}`} onClick={
											() => {
												//Ucini da to hoce li neko polje biti obvezno ne ovisi o polju koje ce se obrisati
												fields2.map((item, i) => {
													if (field.required.isRequired === 'conditional') {
														setValue(
															`fields.${i}.required.dependencies`,
															item.required.dependencies.filter((dependency) => { dependency.label != fields2[index].label })
														)
													}
													//Ucini da vise prikaz niti jednog polja ne ovisi o polju koje ce se izbrisati
													if(field.render.conditional) {
														setValue(
															`fields.${i}.render.dependencies`,
															item.render.dependencies.filter((dependency)=>dependency.label != fields2[index].label)
														)
														//Ako je polje obvezno pod istim uvjetima pod kojima se prikazuje procisti i niz "necessityRequirements" za svako polje
														if(!item.requireIfRendered) {
															setValue(
																`fields.${i}.required.dependencies`,
																item.required.dependencies.filter((dependency) => { dependency.label != fields2[index].label })
															)
														}
													}
												})
												// S obzirom da prikaz nekog polja i to hoce li biti obavezno moze ovisiti samo o poljima s unaprijed ponudjenim odgovorima, provjerava se je li polje koje ce se izbrisati jedino takvo.
												//Ako je, ni jedno polje vise ne moze biti uvjetno obavezno, ili se uvjetno prikazivati
												if (fields2.filter(({ inputType }) => ['radio', 'checkbox'].includes(inputType)).length === 1) {
													fields2.map((field, i) => { if (field.required.isRequired === 'conditional') {
														setValue(`fields.${i}.required.isRequired`, '');  
														setValue(`fields.${i}.render.conditional`, false);
													}})
												}
												remove(index)
											}
										} />}
									</section>
								)
							})}
							{errors.fields && <b className='formErrorMessage'>{errors.fields.message}</b>}
							{errors.fields?.root && <b className='formErrorMessage'>{errors.fields.root.message}</b>}
							<BorderedButton className="addField" onClick={()=>append(emptyField)}>Dodaj novo polje</BorderedButton>
						</div>
					</section>
					<section>
						<div className="titleAndShowHideMenu">
							<button type='button' className={`arrow ${showAppearanceMenu ? 'opened' : 'closed' }`} onClick={()=>shouldShowAppearanceMenu(!showAppearanceMenu)}>
								<Image src='/arrows/show-hide-arrow.png' width={10} height={20} alt='show-hide-arrow'/>
							</button>
							<h2>Završne postavke</h2>
						</div>
						<div className={`formSectionContent ${showAppearanceMenu ? '' : 'displayNone'}`}>
							<div className='labelAndInputContainer'>
								<label htmlFor="alternateThumbnail">Naslovna slika</label>
								<div>
									<span>
										<input type='radio' {...register('thumbnail_setting')} value='default' onClick={()=>{if(values.thumbnail_id) setValue('thumbnail_id', 0); if(values.thumbnail) setValue('thumbnail', undefined)}}/>
										<p>Koristi zadanu</p>
									</span>
									<span>
										<input type='radio' {...register('thumbnail_setting')} value='existing' onClick={()=>{if(values.thumbnail) setValue('thumbnail', undefined)}}/>
										<p>Odaberi s popisa</p>
									</span>
									<span>
										<input type='radio' {...register('thumbnail_setting')} value='new' onClick={()=>{if(values.thumbnail_id) setValue('thumbnail_id', 0)}}/>
										<p>Dodaj novu</p>
									</span>
								</div>
								{errors.thumbnail_setting && <b className='formErrorMessage'>{errors.thumbnail_setting.message}</b>}
							</div>
							{values.thumbnail_setting === 'existing' && 
								<div className='labelAndInputContainer'>
									<label htmlFor='thumbnail_id'>Odaberite naslovnu sliku</label>
									<ThumbnailMenu control={control} current={values.thumbnail_id || 0} />
									{errors.thumbnail_id && <b className="formErrorMessage">{errors.thumbnail_id.message}</b>}
								</div>
							}
							{values.thumbnail_setting === 'new' &&
								<div className='labelAndInputContainer'>
									<label htmlFor="thumbnail">Priložite naslovnu sliku</label>
									<FileInput watch={watch} setValue={setValue} field='thumbnail' getValues={getValues}/>
									{errors.thumbnail && <b className="formErrorMessage">{`${errors.thumbnail.message}`}</b>}
								</div>
							}
							<div className='labelAndInputContainer'>
								<label htmlFor="sketch">Mogućnosti spremanja</label>
								<MyBooleanInput name='sketch' control={control} reversed={true} trueText="Spremi kao skicu" falseText="Spremi i objavi obrazac" />
								{errors.sketch && <b className='formErrorMessage'>{errors.sketch.message}</b>}
							</div>
						</div>
					</section>
				</div>
				<div className="border bottom"></div>
				<div className='buttonContainer'>
					<button type='submit' /*
						
							fields2.map((field, index)=>{
								if(!field.render.conditional) setValue(`fields.${index}.requireIfRendered`, false)
								if(!field.render.statisfyAll) setValue(`fields.${index}.render.statisfyAll`, false)
								if(!field.required.statisfyAll) setValue(`fields.${index}.required.statisfyAll`, false)
								if(field.render.conditional && field.requireIfRendered) {
									setValue(`fields.${index}.required.isRequired`, 'conditional')
									setValue(`fields.${index}.required.statisfyAll`, field.render.statisfyAll)
									setValue(`fields.${index}.required.dependencies`, [...field.render.dependencies], {shouldValidate:true})
								}
							})
							}
						}}*/
					>
						Spremi obrazac
					</button>
					
					<BorderedButton onClick={()=>reset()}>Odustani</BorderedButton>
				</div>
			</form>
		
	)
}

export function NestedField({recordsExist, index, control, register, errors, fields2, setValue}:nestedFieldProps) {
	const {fields, append, prepend, remove} = useFieldArray({name:`fields.${index}.options`, control})
	return (
		<div className="nested">
 		{fields.map((field,i)=> {
			const allowedToDelete = canOptionBeDeleted(fields2, fields2[index], i)
			return (
			<section key={index+i+1} className="option">
				<div className="optionSectionHeaader">
					<p>Odabir br. {i+1}</p>
					<DeleteIcon className={`${!allowedToDelete ? 'disabled':''}`} onClick={()=>{
						fields2.map((item, j)=>{
							if(item.required.isRequired==='conditional') {
								item.required.dependencies.map(({values},k)=>{
									setValue?.(
										`fields.${j}.required.dependencies.${k}.values`, 
										values.filter((value)=>value!=fields2[index].options[i].option)
									)
								})
							}
							else if(item.render.conditional) {
								item.render.dependencies.map(({values},k)=>{
									setValue?.(
										`fields.${j}.render.dependencies.${k}.values`, 
										values.filter((value)=>value!=fields2[index].options[i].option)
									)
								})
							}
						})
						remove(i)
						}}
					/>
				</div>
				<div className="labelAndInputContainer">
					<label htmlFor="options">Unesite {i+1}. mogući odabir: </label>
					{(allowedToDelete && !recordsExist) ? <input type="text" {...register(`fields.${index}.options.${i}.option`)}/> : <p className='fakeInput'>{fields2[index].options[i].option}</p>}
					{errors.fields?.[index]?.options?.[i]?.option && <b className="formErrorMessage">{errors.fields?.[index]?.options?.[i]?.option?.message}</b>}
					{!allowedToDelete && <b className='warningMessage'>{optionDeleteWarning}</b>}
				</div>
			</section>)
		}
	)}
		{errors.fields?.[index]?.options?.root && <b className='formErrorMessage'>{errors.fields?.[index]?.options?.root?.message}</b>}
		{errors.fields?.[index]?.options && <b className="formErrorMessage">{errors.fields?.[index]?.options?.message}</b>}
		<BorderedButton onClick={()=>append({option:''})} className="addOption">Dodaj odabir</BorderedButton>
	</div>)
}

export function ConditionalDependencyForm({index, control, register, errors, fields2, dependencyName='required', setValue}:nestedFieldProps) {
	
	let {fields, append, prepend, remove} = useFieldArray({name:`fields.${index}.${dependencyName}.dependencies`, control})
	
	const label = fields2[index].label
	const dependencies = fields2[index][dependencyName].dependencies

	const dependenciesCount = dependencies.length
	const flag : 'renderIfRequired' | 'requireIfRendered' = dependencyName==='required' ? 'renderIfRequired' : 'requireIfRendered'

	let consideredFields : Field[] = fields2.filter((field:Field, i)=>['radio', 'checkbox'].includes(field.inputType) && field.label !=label && i<index)
	
	return (
		<div className="nested">
			<p> Polje <b>„{label}“</b> će {dependencyName==='required' ? 'biti obvezno' : 'se prikazivati'} ako:</p>
			{fields.map((field,i)=>
				<section key={index+i+1} className="option">
					<div className="optionSectionHeaader">
						<p>Ovisnost br. {i+1}</p>
						<DeleteIcon onClick={()=>remove(i)}/>
					</div>
					<div className="labelAndInputContainer">
						<div className="conditionalDependencyMenu">
							<div>
								<label htmlFor={`fields.${index}.${dependencyName}.${i}.label`}>Polje</label>
								<select {...register(`fields.${index}.${dependencyName}.dependencies.${i}.label`)}>
									{consideredFields.map((item:any, j:number)=> {
										if(label!=item.label && !dependencies.some((dependency,index)=>dependency.label===item.label && index!=i)) 
											return <option key={item.label} value={item.label}>{item.label}</option>
									})}
								</select>
								{errors.fields?.[index]?.[dependencyName]?.dependencies?.[i]?.label && <b className="formErrorMessage">{errors.fields?.[index]?.[dependencyName]?.dependencies?.[i]?.label?.message}</b>}
							</div>
							<div>
								<label htmlFor={`fields.${index}.${dependencyName}.${i}.values`}>Ima vrijednost(i)</label>
								<div className='checkboxContainer'>
									{dependencies[i]?.label &&
										<>
											{fields2.find(({label})=>label===dependencies[i].label)?.options?.map(({option})=>
												<span key={Math.random()}>
													<input type='checkbox' {...register(`fields.${index}.${dependencyName}.dependencies.${i}.values`)} value={option}/>
													<p>{option}</p>
												</span>
											)}
										</>
									}
									{errors.fields?.[index]?.[dependencyName]?.dependencies?.[i]?.values && <b className="formErrorMessage">{errors.fields?.[index]?.[dependencyName]?.dependencies?.[i]?.values?.message}</b>}
								</div>
							</div>
						</div>
					</div>
					
				</section>)}
			{errors.fields?.[index]?.[dependencyName]?.dependencies?.root && <b className='formErrorMessage'>{errors.fields?.[index]?.[dependencyName]?.dependencies?.root?.message}</b>}
			{errors.fields?.[index]?.[dependencyName]?.dependencies && <b className="formErrorMessage">{errors.fields?.[index]?.[dependencyName]?.dependencies?.message}</b>}
			<BorderedButton onClick={()=>append(emptyDependency)} className={`addOption ${dependenciesCount>=consideredFields.length || (dependenciesCount && !dependencies.slice(-1)[0]?.label) ? 'disabled' : ''}`}>
				Dodaj ovisnost
			</BorderedButton>
			{dependencies.length>1 &&
					<div className="labelAndInputContainer radioInputsContainer">
						<label htmlFor={`fields.${index}.${dependencyName}.statisfy`}>Svi uvjeti se moraju zadovoljiti da bi {dependencyName === 'render' ? 'se' : ''} polje {dependencyName === 'render' ? 'prikazalo' : 'bilo obavezno'}</label>
						<MyBooleanInput control={control} name={`fields.${index}.${dependencyName}.statisfyAll`}
							onClickTrue={dependencyName === 'render' ? ()=>{if(fields2[index].requireIfRendered) setValue?.(`fields.${index}.required.statisfyAll`, true)}: undefined}
							onClickFalse={dependencyName === 'render' ? ()=>{if(fields2[index].requireIfRendered) setValue?.(`fields.${index}.required.statisfyAll`, false)}: undefined}
						/>
						{errors.fields?.[index]?.[dependencyName]?.statisfyAll && <b className='formErrorMessage'>{errors.fields[index]?.[dependencyName]?.statisfyAll?.message}</b>}
					</div>
				}
				{dependencyName==='render' && <div className='labelAndInputContainer'>
					<label htmlFor={`fields.${index}.${flag}`}>Učini polje uvjetno obaveznim pod istim uvjetima.</label>
					<MyBooleanInput 
						control={control} name={`fields.${index}.requireIfRendered`}
						onClickTrue={()=>{
							setValue?.(`fields.${index}.required.statisfyAll`, fields2[index].render.statisfyAll)
							setValue?.(`fields.${index}.required.isRequired`, 'conditional')
						}}
						onClickFalse={()=>{
							setValue?.(`fields.${index}.required.isRequired`, '')
						}}
					/>
					{errors.fields?.[index]?.requireIfRendered && <b className='formErrorMessage'>{errors.fields?.[index]?.requireIfRendered?.message}</b>}
				</div>
				}
		</div>
	)
}