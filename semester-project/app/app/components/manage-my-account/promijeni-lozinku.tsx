'use client'
import * as z from 'zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import '../SignUpForm/signUpFormStyle.css'
import { useState } from "react";
import Loading from '../Loading/loading'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link';

interface serverResponse {
	user: any,
	message: string
}

const formSchema = z.object({
	oldPassword: z.string().min(1, 'Potrebno je upisati trenutnu lozinku.'),
	password: z.string().min(1, 'Potrebno je unijeti novu lozinku').min(7, 'Nova lozinka mora imati barem 8 znakova.'),
	confirmPassword: z.string().min(1, 'Potrebno je ponovno unijeti novu lozinku')
})
	.refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Ponovo unesena nova lozinka nije unesenoj u polje iznad.' })

export function OtherFormOptions() {
	return (
		<div className='otherFormOptions'>
			<p>Tražite nešto drugo?</p>
			<Link href='/moj-racun'><b>Natrag na postavke računa</b></Link>
		</div>
	)
}

const ChangePassordForm = () => {
	
	const [success, setSuccess] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)
	const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { oldPassword: '', password: '', confirmPassword: '' } })

	const session=useSession()

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		isLoading(true)
		const response = await fetch('/api/changepassword', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: session.data?.user.id,
				oldpassword: values.oldPassword,
				password: values.password
			})
		})
		const {message}: serverResponse = (await response.json())
		isLoading(false)
		setServerMessage(message)
		if (response.ok) {
			setAttemptOccurred(true)
			setSuccess(true)
			reset()
			signOut({ callbackUrl: '/prijava' })
		} else {
			console.error('Nije moguće promijeniti lozinku', message)
			setAttemptOccurred(true)
		}
	}
	if(loading) return <Loading message='Sustav obrađuje Vaš zahtjev. Molim pričekajte...'/>
	else if(success) return <Loading message={`${serverMessage} Pričekajte da Vas preusmjerimo na stranicu za prijavu`} color='green' bold={true} />
	else return (
		<div className='formContainer'>
			<form onSubmit={handleSubmit(onSubmit)} className='signUpForm'>
				<h3>Promjena lozinke</h3>
				{!success && attemptOccurred && <b className='formErrorMessage'>{serverMessage}</b>}
				<label htmlFor='oldPassword'>Trenutna lozinka</label>
				<input type='password' {...register('oldPassword')} />
				{errors.oldPassword && <b className='formErrorMessage'>{errors.oldPassword.message}</b>}
				<label htmlFor='password'>Nova lozinka</label>
				<input type='password' {...register('password')} autoComplete='new-password'/>
				{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
				<label htmlFor='confirmPassword'>Ponovo unesite novu lozinku</label>
				<input type='password' {...register('confirmPassword')} autoComplete='new-password'/>
				{errors.confirmPassword && <b className='formErrorMessage'>{errors.confirmPassword.message}</b>}
				<div className='buttonContainer'>
					<button type='submit' onClick={() => { attemptOccurred && setAttemptOccurred(false) }} className='formSubmitButton'>Promijeni</button>
					<button type='reset' onClick={() => reset()} className='resetButton'>Odustani</button>
				</div>
				<OtherFormOptions />
			</form>
		</div>
	);
}
export default ChangePassordForm; 