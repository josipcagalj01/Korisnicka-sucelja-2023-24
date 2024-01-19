'use client'
import * as z from 'zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation'
import '../SignUpForm/signUpFormStyle.css'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from "react";
import Loading from '../Loading/loading'

const formSchema = z.object({
	username: z.string().min(1, 'Potrebno je upisati korisničko ime').max(100),
	password: z.string().min(1, 'Potrebno je unijeti lozinku')
})

const SignInForm = () => {
	const [loginSuccess, setLoginSuccess] = useState(true)
	const [errorMessage, setErrorMessage] = useState('')
	const [loading, isLoading] = useState(false)
	const [loginAttemptOccurred, setLoginAttemptOccurred] = useState(false)
	const router = useRouter()

	const { reset, register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { username: '', password: '' } })


	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		isLoading(true)
		const signInData = await signIn('credentials', {
			username: values.username.toLowerCase(),
			password: values.password,
			redirect:false
		})
		reset()
		isLoading(false)
		if (signInData?.error) {
			console.log(signInData.error, 'podaci nisu u redu.')
			setLoginSuccess(false)
			setLoginAttemptOccurred(true)
			if(signInData.error==='CredentialsSignin') setErrorMessage('Korisničko ime ili lozinka nisu točni!')
			else setErrorMessage('Došlo je do greške. Trenutno nije moguće prijaviti Vas u sustav!')
		}
		else {
			setLoginAttemptOccurred(true)
			router.push('/o-sustavu')
		}
	}

	return (
		<>
			<div className='formContainer'>
				<form onSubmit={handleSubmit(onSubmit)} className='w-full signInForm'>
					<h3>Prijava</h3>
					{loading && <Loading message='Provjera vjerodajnica...' width={60} height={60}/>}
					{loginSuccess && loginAttemptOccurred && <Loading bold={true} color='green' message='Uspješno ste prijavljeni. Preglednik trenutno čeka odgovor usluge kojoj namjeravate pristupiti.' width={60} height={60}/>}
					{!loginSuccess && <b className='formErrorMessage'>{errorMessage}</b>}
					<label htmlFor='username'>Korisničko ime</label>
					<input type='text' {...register('username')} />
					{errors.username && <b className='formErrorMessage'>{errors.username.message}</b>}
					<label htmlFor='password'>Lozinka</label>
					<input type='password' {...register('password')} />
					{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
					<button className='w-full mt-6 logInButton' onClick={()=>{!loginSuccess && setLoginSuccess(true); loginAttemptOccurred && setLoginAttemptOccurred(false)}} type='submit'>Prijava</button>
				</form>
				<div className='registrationLinkContainer'>
					<p>Nemate korisnički račun?</p>
					<Link href='/registracija'><p className='linkText'>Registracija</p></Link>
				</div>
				
			</div>
		</>
	);
}

export default SignInForm