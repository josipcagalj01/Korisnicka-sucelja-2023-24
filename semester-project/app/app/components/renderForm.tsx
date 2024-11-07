'use client'
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect } from "react";
import Loading from "./Loading/loading";
import ActionResultInfo from "./actionResultInfo/actionResultInfo";
import BorderedLink, { BorderedButton } from "./BorderedLink/button";
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import './services/servicesFormStyle.css'
import Link from "next/link";
import Image from "next/image";
import { fileTypes } from "../../lib/configureFormLib";
import {generateZodSchema, isSet } from "../../lib/renderFormLib";
import { usePathname, redirect } from "next/navigation";
import RateLimitExceeded from "./RateLimitExceeded";
import TimeConflictCheck from "./timeConflict";
import { upload } from '@vercel/blob/client';
import { FormConfiguration } from "../../lib/db_qurery_functions";
import { transformStr } from "../../lib/otherFunctions";

interface dynamicObject {
	[key:string] : any
}

export default function RenderForm({now, Form, rate}:{now: Date, Form: FormConfiguration, rate: number}) {
	const {avalible_from, ...rest} = Form
	return (
		<TimeConflictCheck now={now} from={avalible_from} until={rest.avalible_until}>
			<DynamicForm form={rest} rate={rate} />
		</TimeConflictCheck>
	)
}

function DynamicForm({rate, form}: {form:Omit<FormConfiguration, 'avalible_from'>, rate:number}) {
	const {fields, rate_limit, ...rest} = form
	
	const [count, setCount] = useState(rate)
	const [success, setSuccess] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)
	
	const path=usePathname()
	let times1='put'; let times2='put'
	if(count>1) times2 += 'a'
	if((form.rate_limit || 0) > 1) times1+='a'
	
	const {schema, emptyForm} : {schema:z.ZodObject<any>, emptyForm?:any} = generateZodSchema(fields)

	const { control, register, handleSubmit, reset, formState: {errors}, getValues, setValue, watch} = useForm<any>({resolver: zodResolver(schema), defaultValues:emptyForm})

	const values = watch()
	
	function shouldRender(index: number) : boolean {
		let returnvalue = false
		let statisfied:number = 0
		if(!fields[index].render.conditional) return true
		else {
				fields[index].render.dependencies.map((dependency)=>{
					const i = fields.map(({label})=>label).indexOf(dependency.label)
					const watchingItem = watch(`a${i}`)
					if(Array.isArray(watchingItem)) {
						dependency.values.map((value)=>{
							if(watchingItem.includes(value)) {
								if(fields[index].render.statisfyAll) ++statisfied
								else returnvalue = true; 
								return
							}
						})
					}
					else {
						if(dependency.values.includes(watchingItem)) {
							if(fields[index].render.statisfyAll) ++statisfied
							else returnvalue = true; 
							return
						}
					}
				})	
		}
		if(fields[index]?.render.statisfyAll) {
			return statisfied===fields[index].render.dependencies.length
		}
		else return returnvalue
	}

	function FileList({ whatToWatch }: { whatToWatch: any }) {
		const watchingItem = watch(whatToWatch)
		return (
			<div className='uploadedFilesList'>
				{watchingItem.map((file: File, index:number) =>{
					let fileType=''
					const extension : string = file.name.split('.').slice(-1)[0]
					let nameToDisplay = file.name.slice(0, file.name.length -  extension.length - 1)
					if(nameToDisplay.length>10) nameToDisplay = nameToDisplay.slice(0,10) + '...' + extension
					else nameToDisplay = file.name
					if(extension.startsWith('doc')) fileType='doc'
					else if (extension==='pdf') fileType='pdf'
					else if(['png','jpg','jpeg'].includes(extension)) fileType='image'
					else if(['zip', '7z'].includes(extension)) fileType = 'archive'
					else if(extension.startsWith('xls')) fileType='xls'
					else fileType='unknown'
					return (
						<div className='uploadedFileCard' key={index}>
							<Image src='/red-x.png' alt='deleteicon' height={15} width={15} className='deleteicon' onClick={()=>{setValue(whatToWatch,Array.from(watchingItem).filter((item,i)=>i!=index))}}/>
							<Link href={URL.createObjectURL(file)} target='_blank'>
							<figure>
								<Image src={`/file-type-icons/${fileType}-filetype-icon.png`} alt={extension} fill={true} sizes='64px' style={{ objectFit: 'contain' }}/>
							</figure>
								<p>{nameToDisplay}</p>
							</Link>
						</div>
					)})}
			</div>
		)
	}

	function FileInput({field, inputTypes, multiple, disabled}: {field: any, inputTypes: string[], multiple?: boolean, disabled?:boolean }) {
		const watchingItem = watch(field)

		function appendFiles(e:React.ChangeEvent<HTMLInputElement>) {
			if(e.currentTarget.files) setValue(field, Array.from(e.currentTarget.files).concat(getValues(field)), {shouldValidate:true})
		}

		return (
			<>
				<FileList whatToWatch={field} />
				<input type='file' name={field} multiple={multiple} disabled={(disabled || watchingItem?.length) && !multiple} className={multiple ? 'multiple' : ''} onChange={(e)=>appendFiles(e)} accept={inputTypes.map((a)=>'.'+a).join(', ')}/>
			</>
		)
	}

	async function onSubmit(values: z.infer<typeof schema>) {
		setAttemptOccurred(true)
		isLoading(true)
		let valuesForDb : dynamicObject = {}

		fields.forEach(({inputType, label},index)=>{
			if(inputType!=='file') valuesForDb[`a${index}`] = (values as any)[`a${index}`]
		})
		
		const response = await fetch('/api' + path, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify(valuesForDb)
		})
		const {submission_id, message}: {submission_id: number, message: string} = await response.json()
		setServerMessage(message)
		if (response.ok) {
			try {
				for(let j=0;j<fields.length;j++) {
					if(fields[j].inputType==='file') {
						for(let i=0; i<(values as any)[`a${j}`].length; i++) {
							await upload([transformStr(rest.category.name), transformStr(rest.department.name), `${rest.id}`, `${submission_id}`, values[`a${j}`][i].name].join('/'), values[`a${j}`][i], {
								access: 'public',
								handleUploadUrl: '/api/upload-form-file',
								clientPayload: JSON.stringify({id: submission_id, field_index: j})
							})
						}
					}
				}
				setAttemptOccurred(true)
				setSuccess(true)
				reset()
			} catch(error) {
				console.error(error)
				setServerMessage('Dogiodila se greška. Nije moguće priložiti datoteke.')
				await fetch('/api/submission-cleanup', {
					method: 'POST',
					headers: {
						"Content-type": 'application/json'
					},
					body: JSON.stringify({submission_id: submission_id})
				})
			}
		}
		else {
			console.error('Nije moguće poslati prijavu.')
			setAttemptOccurred(true)
		}
		isLoading(false)
	}

	if(loading) return <Loading message='Vaš zahtjev se obrađuje. Molim pričekajte...' />
	else if(rate_limit && count>=rate_limit) return <RateLimitExceeded rate={count}/>
	else if(attemptOccurred) return (
		<div className='afterServiceRequestInfo'>
			<ActionResultInfo ok={success} message={serverMessage} />
			<div>
				<BorderedLink href='/usluge?_page=1&_limit=10'>Povratak na usluge</BorderedLink>
				{!success ?
					<BorderedButton onClick={() => { setAttemptOccurred(false); }}>Pokušaj ponovo</BorderedButton> :
					<BorderedButton onClick={()=>{
						if(rate_limit) setCount(count+1);
						setAttemptOccurred(false);
						setSuccess(false);
					}}>
						Ponovo ispunite obrazac
					</BorderedButton>
				}
			</div>
		</div>
	)
	else return (
		<>
			{form.avalible_until && <p className='rateLimitInfo'>Moguće ispuniti do: <b>{form.avalible_until.toLocaleString('hr-HR', {timeZone: 'Europe/Zagreb', dateStyle: 'full', timeStyle: 'short'})}</b></p>}
			{rate_limit && <b className='rateLimitInfo'>Obrazac je moguće ispuniti najviše {rate_limit} {times1}. {count && count < rate_limit ? <>Već ste {count} {times2} ispunili ovaj obrazac.</> : ''}</b>}
			<div className="serviceFormContainer">
				<form className="serviceForm" onSubmit={handleSubmit(onSubmit)}>
					{fields.map((field, index) => {
						if(values[`a${index}`]===null) setValue(`a${index}`, emptyForm[`a${index}`], {shouldValidate:true})
						if(shouldRender(index)) return (
							<div key={field.label} className='labelAndInputContainer'>
								<label htmlFor={`a${index}`}>{field.label}</label>
								{field.inputType === 'file' && <FileInput field={`a${index}`} inputTypes={fileTypes.filter(({type})=>field.fileTypes.includes(type)).map(({extension})=>extension)} multiple={field.multiple} />}
								{['radio', 'checkbox'].includes(field.inputType) &&
									<div className={field.inputType+'Container'}>
										{field.options.map(({ option }) =>
											<span key={option}>
												<input type={field.inputType} value={option} {...register(`a${index}`)} />
												<p>{option}</p>
											</span>
										)}
									</div>
								}
								{['pin', 'text'].includes(field.inputType) && <input type='text' {...register(`a${index}`)} />}
								{['int', 'float'].includes(field.inputType) && <input type='number' {...register(`a${index}`)} step={field.inputType==='float' ? "any" : undefined}/>}
								{field.inputType==='date' && <input type='date' {...register(`a${index}`)} />}
								{errors[`a${index}`] && <b className='formErrorMessage'>{(errors[`a${index}`] as any).message}</b>}
							</div>
						)
						else {
							if(isSet(values[`a${index}`])) setValue(`a${index}`, emptyForm[`a${index}`], {shouldValidate:true})
						}
					})}
					<div className='buttonContainer'>
						<button type='submit'>Pošalji</button>
						<button type='button' onClick={() => reset()}>Odustani</button>
					</div>
				</form>
			</div>
		</>)
}