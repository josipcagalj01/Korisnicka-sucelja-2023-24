'use client'
import * as z from 'zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import './SignUpForm/signUpFormStyle.css'
import { useState} from "react";
import Loading from './Loading/loading'
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

interface serverResponse {
	user: any,
	message: string
}

const formSchema = z.object({
	password: z.string().min(1, 'Potrebno je unijeti lozinku')
})

const DeleteAccountForm = () => {

	const session=useSession()


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
				id: session.data?.user.id,
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
			signOut({ callbackUrl: '/prijava' })
		} else {
			console.error('Nije moguće ukloniti korisnički račun')
			setAttemptOccurred(true)
		}
	}
	if(loading) return <Loading message='Sustav obrađuje Vaš zahtjev. Molim pričekajte ...' />
	else if(success) <Loading message={`${serverMessage} Pričekajte da Vas preusmjerimo na stranicu za prijavu`} color='green' bold={true} />
	return (
		<div className='formContainer'>
			<form onSubmit={handleSubmit(onSubmit)} className='signUpForm'>
				<h3>Brisanje korisničkog računa</h3>
				{!success && attemptOccurred && <b className='formErrorMessage'>{serverMessage}</b>}
				<label htmlFor='password'>Lozinka</label>
				<input type='password' {...register('password')} />
				{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
				<p className='warningMessage'>
					Odabirom gumba „Izbriši račun“ <b>NEPOVRATNO</b> ćete izbrisati svoj korisnički račun. Da biste nakon toga ponovo koristili sustav, morat ćete izraditi novi račun, tj. ponovo se registrirati.
				</p>
				<div className='buttonContainer'>
					<button type='submit' onClick={() => { attemptOccurred && setAttemptOccurred(false) }} className='formSubmitButton'>Izbriši račun</button>
					<button type='reset' onClick={() => { reset(); window.location.href = '/moj-racun' }} className='resetButton'>Odustani</button>
				</div>
				<div className='otherFormOptions'>
					<p>Tražite nešto drugo?</p>
					<Link href='/moj-racun'>Natrag na postavke računa</Link>
				</div>
			</form>
		</div>
	);
}
export default DeleteAccountForm; 