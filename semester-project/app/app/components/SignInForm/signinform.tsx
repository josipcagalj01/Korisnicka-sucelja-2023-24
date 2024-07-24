'use client'
import * as z from 'zod'
import React, {useState} from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import '../SignUpForm/signUpFormStyle.css'
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react'
import Loading from '../Loading/loading'

const formSchema = z.object({
	username: z.string().min(1, 'Potrebno je upisati korisničko ime ili adresu e-pošte').max(100),
	password: z.string().min(1, 'Potrebno je upisati lozinku')
})

const SignInForm = ({callbackUrl}:{callbackUrl?:string}) => {
	const session = useSession()
	
	const [loginSuccess, setLoginSuccess] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [loading, isLoading] = useState(false)
	const [loginAttemptOccurred, setLoginAttemptOccurred] = useState(false)

	if(session.data && !loginAttemptOccurred) window.location.href= `${callbackUrl || '/moj-racun'}`
	const { reset, register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { username: '', password: '' } })
		
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		isLoading(true)
		const signInData = await signIn('credentials', {
			username: values.username.toLowerCase(),
			password: values.password,
			redirect:false,
		})
		reset()
		isLoading(false)
		if (signInData?.error) {
			console.error(signInData.error, 'podaci nisu u redu.')
			setLoginAttemptOccurred(true)
			if(signInData.error==='CredentialsSignin') setErrorMessage('Korisničko ime ili lozinka nisu točni!')
			else setErrorMessage('Došlo je do greške. Trenutno nije moguće prijaviti Vas u sustav!')
		}
		else {
			setLoginAttemptOccurred(true);setLoginSuccess(true)
			window.location.href= `${callbackUrl || '/moj-racun'}`
		}
	}

	if(loading) return <Loading message='Provjera vjerodajnica...'/>
	else if(loginSuccess) return <Loading bold={true} color='green' message='Uspješno ste prijavljeni. Preglednik trenutno čeka odgovor usluge kojoj namjeravate pristupiti.'/>
	else return (
		<div className='formContainer'>
			<form onSubmit={handleSubmit(onSubmit)} className='w-full signInForm'>
				<h3>Prijava</h3>
				{!loginSuccess && <b className='formErrorMessage'>{errorMessage}</b>}
				<label htmlFor='username'>Korisničko ime ili adresa e-pošte</label>
				<input type='text' {...register('username')} />
				{errors.username && <b className='formErrorMessage'>{errors.username.message}</b>}
				<label htmlFor='password'>Lozinka</label>
				<input type='password' {...register('password')} />
				{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
				<button className='w-full mt-6 formSubmitButton' onClick={() => { loginAttemptOccurred && setLoginAttemptOccurred(false) }} type='submit'>Prijava</button>
			</form>
			<div className='registrationLinkContainer'>
				<p>Nemate korisnički račun?</p>
				<Link href='/registracija'><b>Registracija</b></Link>
			</div>
		</div>
	);
}
export default SignInForm