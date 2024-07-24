'use client'
import * as z from 'zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import './SignUpForm/signUpFormStyle.css'
import { useState} from "react";
import Loading from './Loading/loading'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link';

interface serverResponse {
	user: any,
	message: string
}

const formSchema = z.object({
	email: z.string().min(1, 'Potrebno je upisati novu adresu e-pošte.').email('Neispravno upisana adresa-e pošte'),
	password: z.string().min(1, 'Potrebno je unijeti lozinku')
})

const ChangeEmailForm = () => {

	const session=useSession()

	const [success, setSuccess] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)
	const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { email:'', password: ''} })


	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		isLoading(true)
		const response = await fetch('/api/changeemail', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: session.data?.user.id,
				email: values.email.toLowerCase(),
				password: values.password
			})
		})
		reset()
		const message: serverResponse = (await response.json())
		isLoading(false)
		setServerMessage(message.message)
		if (response.ok) {
			setAttemptOccurred(true)
			setSuccess(true)
			reset()
			signOut({ callbackUrl: '/prijava' })
		} else {
			console.error('Nije moguće promijeniti adresu e-pošte')
			setAttemptOccurred(true)
		}
	}
	if(loading) return <Loading message='Sustav obrađuje Vaš zahtjev. Molim pričekajte ...'/>
	else if(success) (<Loading message={`${serverMessage} Pričekajte da Vas preusmjerimo na stranicu za prijavu`} color='green' bold={true} />)
	else return (
		<div className='formContainer'>
			<form onSubmit={handleSubmit(onSubmit)} className='signUpForm'>
				<h3>Promjena adrese e-pošte</h3>
				{!success && <b className='formErrorMessage'>{serverMessage}</b>}
				<label htmlFor='email'>Nova adresa e-pošte</label>
				<input type='text' {...register('email')} />
				{errors.email && <b className='formErrorMessage'>{errors.email.message}</b>}
				<label htmlFor='password'>Lozinka</label>
				<input type='password' {...register('password')} />
				{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
				<div className='buttonContainer'>
					<button type='submit' onClick={() => { attemptOccurred && setAttemptOccurred(false)}} className='formSubmitButton'>Promijeni</button>
					<button type='reset' onClick={() => reset()} className='resetButton'>Odustani</button>
				</div>
				<div className='otherFormOptions'>
					<p>Tražite nešto drugo?</p>
					<Link href='/moj-racun'>Natrag na postavke računa</Link>
				</div>
			</form>
		</div>
	);
}
export default ChangeEmailForm;