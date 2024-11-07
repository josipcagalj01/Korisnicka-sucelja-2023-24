'use client'
import {useFieldArray, useForm} from "react-hook-form";
import '../services/servicesFormStyle.css'
import BorderedLink, { BorderedButton } from "../BorderedLink/button";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useContext } from "react";
import Loading from "../Loading/loading";
import ActionResultInfo from "../actionResultInfo/actionResultInfo";
import { useSession } from "next-auth/react";
import {fieldDeleteWarning, canFieldBeDeleted} from '../../../lib/configureFormLib'
import { ConditionalDependencyForm, NestedField, deleteField} from "./add-form";
import DeleteIcon from "../delete-icon/delete-icon";
import ThumbnailMenu from "./thumbnail-menu/thumbnail-menu";
import FileInput from "./file-input/file-input";
import Image from "next/image";
import {
	fileTypes, inputTypes,
	formSchema,
	Form, RenderSetings, RequirementSettings, changesExist
} from '../../../lib/configureFormLib'
import { upload } from '@vercel/blob/client';
import { MyBooleanInput, NumberInput, DateInput } from "./special-inputs";
import { shouldMoveField, moveField } from "./add-form";
import { ManageFormsContext } from "../../context/manage-forms-context";

const RequirementConfig : RequirementSettings = {isRequired: '', statisfyAll: false, dependencies: []}
const RenderConfig : RenderSetings = {statisfyAll: false, dependencies: [], conditional: false}
const emptyField = {label:'', inputType:'', fileTypes:[], required:RequirementConfig, render:RenderConfig,  options:[], /*renderIfRequired:'', requireIfRendered: ''*/}

const recordsExistMessage = 'Neki korisnici su već ispunili ovaj obrazac. Zbog toga nije moguće dodavati i uklanjati postojeća polja, kao ni mijenjati njihove značajke.'

export default function UpdateForm({form, recordsExist}: {recordsExist: boolean, form: {id: number} & Form}) {
	const [attemptFailed, setAttemptFailed] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)
	
	const {categories, departments} = useContext(ManageFormsContext) || {categories: null, departments: null}

	const [showCoreMenu, shouldShowCoreMenu] = useState(true)
	const [showAvalibilityMenu, shouldShowAvalibilityMenu] = useState(true)
	const [showContentMenu, shouldShowContentMenu] = useState(!recordsExist)
	const [showAppearanceMenu, shouldShowAppearanceMenu] = useState(true)
		
	const session = useSession()

	
	const {control, formState: {errors}, register, handleSubmit, reset, getValues, watch, setValue } = useForm<Form>({
		resolver: zodResolver(formSchema),
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		defaultValues: {...form, thumbnail: undefined}
	})
	const {fields, append, prepend, remove} = useFieldArray({name:'fields', control})

	const values=watch()
	const fields2 = watch('fields')

	async function onSubmit(values: Form) {
		
		isLoading(true)
		setAttemptOccurred(true)

		let {fields, thumbnail, thumbnail_id, thumbnail_setting, ...rest } = values
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
		try {
			const response = await fetch('/api/update-form', {
				method: 'POST',
				headers : {'content-type': 'application/json'},
				body: JSON.stringify({
					id: form.id,
					fields:fields,
					
					thumbnail_id : thumbnail ? null : thumbnail_id,
					thumbnail_setting: thumbnail ? 'default' : thumbnail_setting,
					...rest
				})
			})
		
			const message: {message: string} = (await response.json())
			
			setServerMessage(message.message)
			if (response.ok) {
				if(values.thumbnail) { 
					await upload('form-thumbnails/' + values.thumbnail.name, values.thumbnail, {
						access: 'public',
						handleUploadUrl: '/api/upload-file',
					});
				}
				reset()
				isLoading(false)
			}
			else {
				console.error('Nije moguće pohraniti promjene.')
				isLoading(false)
				setAttemptFailed(true)
			}			
		} catch(error) {
			console.error(error)
			isLoading(false)
			setServerMessage('Dogodila se greška. Nije moguće pohraniti promjene.')
			setAttemptFailed(true)
			}
	}

	if(!attemptOccurred && loading) return <Loading message='Inicijalizacija u tijeku...' />
	else if(loading) return <Loading message='Vaš zahtjev se obrađuje. Molim pričekajte...' />
	else if(attemptOccurred) return (
		<div className='afterServiceRequestInfo'>
			<ActionResultInfo ok={!attemptFailed} message={serverMessage} />
			<div>
				<BorderedLink href='/moj-racun'>Povratak osobnu stranicu</BorderedLink>
				{attemptFailed ?
					<BorderedButton onClick={() => { setAttemptOccurred(!attemptOccurred); setAttemptFailed(false)}}>Pokušaj ponovo</BorderedButton> :
					<BorderedLink href='/obrasci?_page=1&_limit=15'>Povratak na popis obrazaca</BorderedLink>
				}
			</div>
		</div>
	)
	else return (
			<form onSubmit={handleSubmit(onSubmit)} className='serviceForm'>
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
								<select {...register('department_id', { valueAsNumber: true })} value={values.department_id}>
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
								<MyBooleanInput control={control} name='start_time_limited' />
								{errors.start_time_limited && <b className="formErrorMessage">{errors.start_time_limited.message}</b>}
							</div>
							{values.start_time_limited &&
								<div className="labelAndInputContainer">
									<label htmlFor="avalible_from">Odredite od kada će obrazac biti dostupan</label>
									<DateInput name="avalible_from" control={control} />
									{errors.avalible_from && <b className="formErrorMessage">{errors.avalible_from.message}</b>}
								</div>
							}
							<div className="labelAndInputContainer">
								<label htmlFor="end_time_limited">Hoće li obrazac prestati biti dostupan u točno određenom trenutku?</label>
								<MyBooleanInput control={control} name='end_time_limited' onClickFalse={()=>{if(values.avalible_until) setValue('avalible_until', null)}}/>
								{errors.end_time_limited && <b className="formErrorMessage">{errors.end_time_limited.message}</b>}
							</div>
							{values.end_time_limited &&
								<div className="labelAndInputContainer">
									<label htmlFor="avalible_until">Odredite do kada će obrazac biti dostupan.</label>
									<DateInput name="avalible_until" control={control} />
									{errors.avalible_until && <b className="formErrorMessage">{errors.avalible_until.message}</b>}
								</div>
							}
							<div className="labelAndInputContainer">
								<label htmlFor="rate_limit_set">Ograniči broj prijava po korisniku</label>
								<MyBooleanInput control={control} name='rate_limit_set' onClickFalse={()=>setValue('rate_limit', null)}/>
							</div>
							{values.rate_limit_set &&
								<div className="labelAndInputContainer">
									<label htmlFor="rate_limit">Odredite koliko najviše puta korisnik može ispuniti obrazac.</label>
									<NumberInput control={control} name="rate_limit" />
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
						{recordsExist && <b className="warningMessage">{recordsExistMessage}</b>}
						{fields.map((field, index) => {
							const allowedToDelete = canFieldBeDeleted(fields2, index)
							const inputType = watch(`fields.${index}.inputType`)

							const a = watch(`fields.${index}.render.conditional`)
							if (a === null) setValue(`fields.${index}.render.conditional`, false, { shouldValidate: true })

							const b = watch(`fields.${index}.required.isRequired`)
							if (b === null) setValue(`fields.${index}.required.isRequired`, '', { shouldValidate: true })
							
							const c = watch(`fields.${index}.multiple`)
							if(c===null) setValue(`fields.${index}.multiple`, undefined, {shouldValidate:true})

							return (
								<section className={`unnested field  ${recordsExist ? 'pointer-events-none' : ''}`} key={index}>
									<div className="fieldSectionHeader">
										<p>Polje br. {index + 1}</p>
										<div className="fieldNav">
											<button type="button" className="arrow" disabled={!shouldMoveField(-1, index, fields2)} onClick={()=>moveField(-1, index, fields2, setValue)}>
												<Image src='/arrows/arrow.png' width={22} height={22} alt='arrow' />
											</button>
											<button className="arrow down" disabled={!shouldMoveField(1, index, fields2)} type='button' onClick={()=>moveField(1, index, fields2, setValue)}>
												<Image src='/arrows/arrow.png' width={64} height={64} alt='arrow' style={{objectFit:'contain'}}/>
											</button>
											<DeleteIcon className={`${!allowedToDelete ? 'disabled' : ''}`} onClick={
												() => { deleteField(fields2, index, reset)/* 
													//Ucini da to hoce li neko polje biti obvezno ne ovisi o polju koje ce se obrisati
													fields2.map((item, i) => {
														if (field.required.isRequired === 'conditional') {
															setValue(
																`fields.${i}.required.dependencies`,
																item.required.dependencies.filter((dependency) => { dependency.label != fields2[index].label })
															)
														}
														//Ucini da vise prikaz niti jednog polja ne ovisi o polju koje ce se izbrisati
														if (field.render.conditional) {
															setValue(
																`fields.${i}.render.dependencies`,
																item.render.dependencies.filter((dependency) => dependency.label != fields2[index].label)
															)
															//Ako je polje obvezno pod istim uvjetima pod kojima se prikazuje procisti i niz "necessityRequirements" za svako polje
															if (!item.requireIfRendered) {
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
														fields2.map((field, i) => {
															if (field.required.isRequired === 'conditional') {
																setValue(`fields.${i}.required.isRequired`, '');
																setValue(`fields.${i}.render.conditional`, false);
															}
														})
													}
													remove(index)
												*/}}
											/>
										</div>
									</div>
									<div className='fieldProperties'>
										{!allowedToDelete && <b className='warningMessage'>{fieldDeleteWarning}</b>}
										<div className="labelAndInputContainer">
											<label htmlFor={`fields.${index}.label`}>Naziv polja</label>
											{(allowedToDelete && !recordsExist) ? <input type='text' {...register(`fields.${index}.label`)} /> : <p className="fakeInput">{fields2[index].label}</p>}
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
												onClickFalse={() => {
													setValue(`fields.${index}.render.statisfyAll`, false)
													if (fields2[index].required.isRequired === 'conditional') setValue(`fields.${index}.required.isRequired`, '')
												}}
											/>
											{errors.fields?.[index]?.render?.conditional && <b className='formErrorMessage'>{errors.fields[index]?.render?.conditional?.message}</b>}
										</div>
										{fields2[index].render.conditional && <ConditionalDependencyForm index={index} control={control} register={register} errors={errors} fields2={fields2} dependencyName="render" setValue={setValue} />}
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
											{allowedToDelete ?
												<select {...register(`fields.${index}.inputType`)}>
													{inputTypes.map(({ type, toDisplay }) => <option key={toDisplay} value={type}>{toDisplay}</option>)}
												</select> :
												<p className="fakeSelect">{inputTypes.find(({ type }) => type === fields2[index].inputType)?.toDisplay}</p>
											}
											{errors.fields?.[index]?.inputType && <b className="formErrorMessage">{errors.fields?.[index]?.inputType?.message || ''}</b>}
										</div>
										{['checkbox', 'radio'].includes(inputType) && <NestedField index={index} control={control} register={register} errors={errors} fields2={fields2} setValue={setValue} recordsExist={recordsExist} />}
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
								</section>
							)
						})}
						{errors.fields && <b className='formErrorMessage'>{errors.fields.message}</b>}
						{errors.fields?.root && <b className='formErrorMessage'>{errors.fields.root.message}</b>}
						{!recordsExist && <BorderedButton className="addField" onClick={() => append(emptyField)}>Dodaj novo polje</BorderedButton>}
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
									<input type='radio' {...register('thumbnail_setting')} value='existing' onClick={()=>{if(values.thumbnail) {setValue('thumbnail', undefined);} setValue('thumbnail_id', values.thumbnail_id || form.thumbnail_id)}}/>
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
								<label htmlFor='thumbnail_name'>Odaberite naslovnu sliku</label>
								<ThumbnailMenu current={values.thumbnail_id || 0} control={control} />
								{errors.thumbnail_id && <b className="formErrorMessage">{errors.thumbnail_id.message}</b>}
							</div>
						}
						{values.thumbnail_setting === 'new' &&
							<div className='labelAndInputContainer'>
								<label htmlFor="thumbnail">Priložite naslovnu sliku</label>
								<FileInput watch={watch} setValue={setValue} field='thumbnail' getValues={getValues} />
								{errors.thumbnail && <b className="formErrorMessage">{`${errors.thumbnail.message}`}</b>}
							</div>
						}
						<div className='labelAndInputContainer'>
							<label htmlFor="sketch">Mogućnosti spremanja</label>
							<MyBooleanInput name='sketch' control={control} reversed={true} trueText="Spremi kao skicu" falseText="Spremi i objavi obrazac" disableTrue={!form.sketch} />
							{errors.sketch && <b className='formErrorMessage'>{errors.sketch.message}</b>}
						</div>
					</div>
				</section>
				<div className='buttonContainer'>
					<button type='submit' className={!changesExist(form, values) ? 'disabled' : ''} /*
						
							fields2.map((field, index)=>{
								if(field.requireIfRendered===null) setValue(`fields.${index}.requireIfRendered`, undefined)
								if(field.required.isRequired===null) setValue(`fields.${index}.required.isRequired`, '')
								if(!field.render.conditional) setValue(`fields.${index}.requireIfRendered`, false)
								if(!field.render.statisfyAll) setValue(`fields.${index}.render.statisfyAll`, false)
								if(!field.required.statisfyAll) setValue(`fields.${index}.required.statisfyAll`, false)
								if(field.render.conditional && field.requireIfRendered) {
									setValue(`fields.${index}.required.isRequired`, 'conditional')
									setValue(`fields.${index}.required.statisfyAll`, field.render.statisfyAll)
									//setValue(`fields.${index}.required.dependencies`, [...field.render.dependencies], {shouldValidate:true})
								}
							})
							}
						}}*/
					>
						Pohrani promjene
					</button>
					<button type='button' onClick={()=>reset()}>Odustani</button>
				</div>
			</form>
	)
}