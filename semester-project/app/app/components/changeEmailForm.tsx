'use client'
import * as z from 'zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import './SignUpForm/signUpFormStyle.css'
import { useState} from "react";
import Loading from './Loading/loading'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {Error401} from './error/errorXYZ';
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

	const session2=useSession()
	const path = usePathname()

	const [attemptFailed, setAttemptFailed] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)
	const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { email: session2.data?.user.email, password: ''} })


	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		isLoading(true)
		const response = await fetch('/api/changeemail', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: session2.data?.user.id,
				email: values.email.toLowerCase(),
				password: values.password
			})
		})
		reset()
		const message: serverResponse = (await response.json())
		isLoading(false)
		setServerMessage(message.message)
		if (response.ok) {
			signOut({ callbackUrl: '/prijava' })
			setAttemptOccurred(true)
		} else {
			console.error('Nije moguće promijeniti adresu e-pošte')
			setAttemptFailed(true)
			setAttemptOccurred(true)
		}
	}
	if(session2.status==='loading') return <Loading message='Učitavanje...'/>
	return (
		<>{session2.data ?
			<div className='formContainer'>
				<form onSubmit={handleSubmit(onSubmit)} className='signUpForm'>
					<h3>Promjena adrese e-pošte</h3>
					{loading && <Loading message='Sustav obrađuje Vaš zahtjev. Molim pričekajte ...' />}
					{!attemptFailed && attemptOccurred && <Loading message={`${serverMessage} Pričekajte da Vas preusmjerimo na stranicu za prijavu`} color='green' bold={true} />}
					{attemptFailed && <b className='formErrorMessage'>{serverMessage}</b>}
					<label htmlFor='email'>Nova adresa e-pošte</label>
					<input type='text' {...register('email')} />
					{errors.email && <b className='formErrorMessage'>{errors.email.message}</b>}
					<label htmlFor='password'>Lozinka</label>
					<input type='password' {...register('password')} />
					{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
                    <div className='buttonContainer'>
                        <button type='submit' onClick={() => { attemptFailed && setAttemptFailed(false); attemptOccurred && setAttemptOccurred(false) }} className='formSubmitButton'>Promijeni</button>
                        <button type='reset' onClick={()=>reset()} className='resetButton'>Odustani</button>
                    </div>
                    <div className='otherFormOptions'>
                        <p>Tražite nešto drugo?</p>
                        <Link href='/moj-racun/promjena-lozinke'>Promjeni lozinku</Link>
                        <Link href='/moj-racun/promjena-korisnickog-imena'>Promjeni korisničko ime</Link>
                    </div>
					
				</form>
			</div> :
			<Error401 callbackUrl={path}/>}
		</>
	);
}
export default ChangeEmailForm;