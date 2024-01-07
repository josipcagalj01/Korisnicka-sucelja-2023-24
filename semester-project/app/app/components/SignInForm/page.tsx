'use client'
import * as z from 'zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation'
import '../signupform/signUpFormStyle.css'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from "react";

const formSchema = z.object({
	username: z.string().min(1, 'Potrebno je upisati korisničko ime').max(100),
	password: z.string().min(1, 'Potrebno je unijeti lozinku')
})

const SignInForm = () => {
	const [loginSuccess, setLoginSuccess] = useState(true)
	const [errorMessage, setErrorMessage] = useState('')
	const [loginAttemptOccurred, setLoginAttemptOccurred] = useState(false)
	const router = useRouter()

	const { reset, register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { username: '', password: '' } })

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const signInData = await signIn('credentials', {
			username: values.username,
			password: values.password,
			redirect: false
		})
		reset()
		if (signInData?.error) {
			console.log(signInData.error, 'podaci nisu u redu.')
			setLoginSuccess(false)
			setLoginAttemptOccurred(true)
			if(signInData.error==='CredentialsSignin') setErrorMessage('Korisničko ime ili lozinka nisu točni!')
			else setErrorMessage('Došlo je do greške. Trenutno nije moguće prijaviti Vas u sustav!')
		}
		else {
			router.push('/o-sustavu')
			setLoginAttemptOccurred(true)
		}
	}

	return (
		<>
			<div className='formContainer'>
				<form onSubmit={handleSubmit(onSubmit)} className='w-full'>
					{loginSuccess && loginAttemptOccurred && <b className='formOkMessage'>Uspješno ste prijavljeni. Preglednik trenutno čeka odgovor usluge kojoj namjeravate pristupiti</b>}
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