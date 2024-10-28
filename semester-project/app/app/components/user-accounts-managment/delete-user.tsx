'use client'
import * as z from 'zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import '../SignUpForm/signUpFormStyle.css'
import { useState} from "react";
import Loading from '../Loading/loading'
import BorderedLink from '../BorderedLink/button';
import Link from 'next/link';
import ActionResultInfo from '../actionResultInfo/actionResultInfo';

interface serverResponse {
	user: any,
	message: string
}

const formSchema = z.object({
	password: z.string().min(1, 'Potrebno je unijeti lozinku')
})

const DeleteUserForm = ({id}:{id:number}) => {
	const [success, setSuccess] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)
	const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: {password: ''} })


	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		isLoading(true)
		const response = await fetch('/api/deleteaccount', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: id,
				password: values.password
			})
		})
		
		const message: serverResponse = (await response.json())
		isLoading(false)
		setServerMessage(message.message)
		if (response.ok) {
			setSuccess(true)
			setAttemptOccurred(true)
			reset()
			
		} else {
			console.error('Nije moguće ukloniti korisnički račun')
			setAttemptOccurred(true)
		}
	}

	if(loading) return <Loading message='Sustav obrađuje Vaš zahtjev. Molim pričekajte ...' />
	else if(success) return (
		<div className='afterServiceRequestInfo'>
			<ActionResultInfo ok={success} message={serverMessage} />
			<div>
				<BorderedLink href='/moja-stranica'>Povratak osobnu stranicu</BorderedLink>
				<BorderedLink href='/upravljanje-sustavom/upravljanje-korisnicima?_page=1&_limit=24'>Povratak na korisničke račune</BorderedLink>
			</div>
		</div>
	)
	else return (
		<div className='formContainer'>
			<form onSubmit={handleSubmit(onSubmit)} className='signUpForm'>
				<h3>Brisanje korisničkog računa</h3>
				{!success && attemptOccurred && <b className='formErrorMessage'>{serverMessage}</b>}
				<label htmlFor='password'>Unesite svoju lozinku</label>
				<input type='password' {...register('password')} autoComplete='new-password'/>
				{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
				<p className='warningMessage'>
					Odabirom gumba „Izbriši račun“ <b>NEPOVRATNO</b> ćete izbrisati ovaj korisnički račun. Da bi korisnik nakon toga mogao ponovo koristili sustav, morat će se ponovo stvoriti njegov korisnički račun.
				</p>
				<div className='buttonContainer'>
					<button type='submit' onClick={() => { attemptOccurred && setAttemptOccurred(false) }} className='formSubmitButton'>Izbriši račun</button>
					<button type='reset' onClick={() => { reset(); window.location.href = '/upravljanje-sustavom/upravljanje-korisnicima' }} className='resetButton'>Odustani</button>
				</div>
				<div className='otherFormOptions'>
					<p>Tražite nešto drugo?</p>
					<Link href='/upravljanje-sustavom/upravljanje-korisnicima'>Natrag na popis korisničkih računa</Link>
				</div>
			</form>
		</div>
	);
}
export default DeleteUserForm; 