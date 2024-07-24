'use client'
import * as z from 'zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import './SignUpForm/signUpFormStyle.css'
import Loading from './Loading/loading'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link';

interface serverResponse {
	user: any,
	message: string
}

const formSchema = z.object({
	username: z.string().min(1, 'Potrebno je upisati željeno korisničko ime.'),
	password: z.string().min(1, 'Potrebno je unijeti lozinku')
})

const ChangeUsernameForm = () => {

	const session=useSession()

	const [success, setSuccess] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)
	const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { username: '', password: ''} })


	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		isLoading(true)
		const response = await fetch('/api/changeusername', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: session.data?.user.id,
				username: values.username.toLowerCase(),
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
			console.error('Nije moguće promijeniti koorisničko ime')
			setAttemptOccurred(true)
		}
	}
	if(loading) return <Loading message='Sustav obrađuje Vaš zahtjev. Molim pričekajte ...' />
	else if(success) return <Loading message={`${serverMessage} Pričekajte da Vas preusmjerimo na stranicu za prijavu`} color='green' bold={true} />
	else return (
		<div className='formContainer'>
			<form onSubmit={handleSubmit(onSubmit)} className='signUpForm'>
				<h3>Promjena korisničkog imena</h3>
				{!success && attemptOccurred && <b className='formErrorMessage'>{serverMessage}</b>}
				<label htmlFor='username'>Novo korisničko ime</label>
				<input type='text' {...register('username')} />
				{errors.username && <b className='formErrorMessage'>{errors.username.message}</b>}
				<label htmlFor='password'>Lozinka</label>
				<input type='password' {...register('password')} />
				{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
				<div className='buttonContainer'>
					<button type='submit' onClick={() => { attemptOccurred && setAttemptOccurred(false) }} className='formSubmitButton'>Promijeni</button>
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
export default ChangeUsernameForm; 