'use client'

import BorderedLink, {BorderedButton} from "../BorderedLink/button"
import { formSchema, defaultValues, Form } from "../../../lib/manage-announcments/add-update-announcment-lib"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useContext, useEffect } from "react"
import { useSession } from "next-auth/react"
import Loading from "../Loading/loading"
import ActionResultInfo from "../actionResultInfo/actionResultInfo"
import Image from "next/image"
import { upload } from '@vercel/blob/client';
import { ManageAnnouncmentContext } from "../../context/manage-announcment-context"
import ThumbnailMenu from "./thumbnail-menu"
import { MyBooleanInput } from "./special-inputs"
import ThumbnailInput from "./file-input/file-input"
import { AttachmentInput } from "./file-input/file-input"
import NewsRichTextEditor from "./rich-text-editor/rich-text-editor"
import PickFormToAttach from "./attached-form-picker"
import { transformStr } from "../../../lib/otherFunctions"
import TemplateMenu from "./template-menu"

import '../services/servicesFormStyle.css'

export default function AddAnnouncment({configuration}: {configuration?: Omit<Form, 'thumbnail' | 'attachments' | 'existing_attachments' | 'attach_form' | 'department_id' | 'sketch'> | null}) {
	const {control, register, setValue, watch, formState: {errors}, handleSubmit, reset, getValues} = useForm<Form>({resolver: zodResolver(formSchema), defaultValues: defaultValues, reValidateMode: 'onSubmit'})

	const [showTemplateMenu, shouldShowTemplateMenu] = useState(configuration===undefined)
	const [attemptFailed, setAttemptFailed] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)

	const [showCoreMenu, shouldShowCoreMenu] = useState(true)
	const [showContentMenu, shouldShowContentMenu] = useState(true)
	const [showAppearanceMenu, shouldShowAppearanceMenu] = useState(true)

	const {categories, departments, existingForms} = useContext(ManageAnnouncmentContext) || {categories: null, departments: null}

	useEffect(()=>{
		if(configuration) {
			setValue('attach_form', configuration?.form_id ? true : null)
			setValue('form_id', configuration?.form_id)
			setValue('category_id', configuration?.category_id)
			setValue('title', configuration?.title)
			setValue('content', configuration.content)
			setValue('thumbnail_setting', configuration.thumbnail_setting)
			setValue('thumbnail_id', configuration.thumbnail_id)
		}
	}, [configuration])

	const session = useSession()
	const values = watch()

	if(values.category_id===4) {
		if(values.attach_form) setValue('attach_form', false)
		if(values.form_id) setValue('form_id',null)
	}
	if(values.form_id) {
		const form = existingForms?.find(({id})=>id===values.form_id)
		if(form?.category.id !== values.category_id || form.department_id!==values.department_id) setValue('form_id', null)
	}
	const denyFormAttaching = existingForms?.filter((a)=>a.category.id===values.category_id && a.department_id===values.department_id).length===0
	if(denyFormAttaching) {
		if(values.attach_form) setValue('attach_form', false)
		if(values.form_id) setValue('form_id', null)
	}
	
	
	async function onSubmit(values: Form) {
		isLoading(true)
		setAttemptOccurred(true)
		
		const {thumbnail, attachments, ...rest} = values
		console.log(rest.content)
		const response = await fetch('/api/dodaj-objavu', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(rest)
		})
		const {message, newAnnouncmentId} : {message: string, newAnnouncmentId: number} = await response.json()
		setServerMessage(message)
		if(response.ok) {
			//reset()
			if(thumbnail || attachments?.length) {
				try {
					if(thumbnail) {
						await upload('form-thumbnails/' + values.thumbnail.name, values.thumbnail, {
							access: 'public',
							handleUploadUrl: '/api/upload-announcment-thumbnail/',
							clientPayload: JSON.stringify({id: newAnnouncmentId})
						});
					}

					if(attachments?.length) {
						for(let i=0; i<attachments.length; i++) {
							await upload(
								[
									'obavijesti',
									transformStr(categories?.find(({id})=>id===rest.category_id)?.name || ''),
									transformStr(departments?.find(({id})=>id===rest.department_id)?.name || ''),
									newAnnouncmentId, transformStr(attachments[i].name)
								].join('/'),
								attachments[i], {
									access: 'public',
									handleUploadUrl: '/api/upload-announcment-file',
									clientPayload: JSON.stringify({id: newAnnouncmentId})
							})
						}
					}
				} catch(error) {
					setServerMessage(message + ' Dogodio se problem pri pohrani datoteka na poslužitelj. Možete ih pokušati ponovo prenijeti kroz stranicu za upravljanje objavama')
				}
			}
			isLoading(false)
		}
		else {
			console.error('Nije moguće pohraniti objavu.')
				setAttemptFailed(true)
				isLoading(false)
		}	
	}

	if(!attemptOccurred && loading) return <Loading message='Inicijalizacija u tijeku...' />
	else if(showTemplateMenu) return (<TemplateMenu setValue={setValue} isLoading={isLoading} showMenu={shouldShowTemplateMenu}/>)
	else if(loading) return <Loading message='Molim pričekajte. Sustav zaprima objavu...' />
	else if(attemptOccurred) return (
		<div className='afterServiceRequestInfo'>
			<ActionResultInfo ok={!attemptFailed} message={serverMessage} />
			<div>
				<BorderedLink href='/moj-racun'>Povratak osobnu stranicu</BorderedLink>
				{attemptFailed ?
					<BorderedButton onClick={() => { setAttemptOccurred(!attemptOccurred); setAttemptFailed(false)}}>Pokušaj ponovo</BorderedButton> :
					<>
						<BorderedLink href='/objave?_page=1&_limit=15'>Povratak na objave</BorderedLink>
						<BorderedButton onClick={() => { setAttemptOccurred(!attemptOccurred);}}>Napiši novu objavu</BorderedButton>				
					</>
				}
			</div>
		</div>
	)
	else return (
		<form className="serviceForm" onSubmit={handleSubmit(onSubmit)}>
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
								<label htmlFor='departmentId'>Upravni odjel odgovoran za ovu obavijest</label>
								<select {...register('department_id', { valueAsNumber: true })} value={values.department_id}>
									<option disabled value={0} className='displayNone'></option>
									{departments?.map(({ name, id }) => <option key={name} value={id}>{name}</option>)}
								</select>
								{errors.department_id && <b className='formErrorMessage'>{errors.department_id.message}</b>}
							</div>
						}
						<div className="labelAndInputContainer">
							<label htmlFor='category_id'>Odaberite kategoriju obavijesti</label>
							<select {...register('category_id', { valueAsNumber: true })} value={values.category_id}>
								<option disabled value={0} className='displayNone'></option>
								{categories?.map(({ name, id }) => <option key={name} value={id}>{name}</option>)}
							</select>
							{errors.category_id && <b className='formErrorMessage'>{errors.category_id.message}</b>}
						</div>
						<div className="labelAndInputContainer">
							<label htmlFor="title">Unesite naslov obavijesti</label>
							<input type="text" {...register('title')} />
							{errors.title && <b className='formErrorMessage'>{errors.title.message}</b>}
						</div>
					</div>
				</section>
				<section>
					<div className="titleAndShowHideMenu">
						<button type='button' className={`arrow ${showContentMenu ? 'opened' : 'closed' }`} onClick={()=>shouldShowContentMenu(!showContentMenu)}>
							<Image src='/arrows/show-hide-arrow.png' width={10} height={20} alt='show-hide-arrow'/>
						</button>
						<h2>Sadržaj objave</h2>
					</div>
					<div className={`formSectionContent ${showContentMenu ? '' : 'displayNone'}`}>
						<div className='labelAndInputContainer'>
							<label htmlFor="content">Napišite tekst objave</label>
							<NewsRichTextEditor content={values.content} onChange={()=>{}} field="content" setValue={setValue}/>
							{errors.content && <b className='formErrorMessage'>{`${errors.content.message}`}</b>}
						</div>
						<div className='labelAndInputContainer'>
							<label htmlFor='attachments'>Privitci</label>
							<AttachmentInput existingAttachments={values.existing_attachments} setValue={setValue} getValues={getValues} field='attachments' watch={watch}/>
							{errors.attachments && <b className='formErrorMessage'>{errors.attachments.message}</b>}
						</div>
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
									<input type='radio' {...register('thumbnail_setting')} value='existing' onClick={()=>{if(values.thumbnail) {setValue('thumbnail', undefined);} setValue('thumbnail_id', values.thumbnail_id)}}/>
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
								<ThumbnailInput watch={watch} setValue={setValue} field='thumbnail' getValues={getValues} />
								{errors.thumbnail && <b className="formErrorMessage">{`${errors.thumbnail.message}`}</b>}
							</div>
						}
						{values.category_id!==0 && values.category_id!==4 &&
							<>
								<div className={`${denyFormAttaching ? 'disabled ' : ''}labelAndInputContainer`}>
									<label>Dodaj poveznicu na obrazac</label>
									<MyBooleanInput name='attach_form' control={control}/>
									{errors.attach_form && <b className='formErrorMessage'>{errors.attach_form.message}</b>}
								</div>
								{!denyFormAttaching && values.attach_form && <PickFormToAttach current={values.form_id || 0} control={control} category_id={values.category_id} department_id={values.department_id}/>}
							</>
						}
						<div className='labelAndInputContainer'>
							<label htmlFor="sketch">Vidljivost objave</label>
							<MyBooleanInput name='sketch' control={control} reversed={true} trueText="Sakrij od posjetitelja" falseText="Prikaži na stranici „Obavijesti“"/>
							{errors.sketch && <b className='formErrorMessage'>{errors.sketch.message}</b>}
						</div>
					</div>
				</section>
			</div>
			<div className="border bottom"></div>
			<div className="buttonContainer">
				<button type="submit">Spremi objavu</button>
				<BorderedButton onClick={()=>reset()}>Odustani</BorderedButton>
			</div>
		</form>
	)
}