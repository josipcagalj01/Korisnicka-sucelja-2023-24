'use client'
import Link from 'next/link'
import * as z from 'zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation'
import './signUpFormStyle.css'
import Loading from '../Loading/loading'
import { useSession } from 'next-auth/react'

interface serverResponse {
	user: any,
	message: string
}

const formSchema = z.object({
	pin: z.string().min(1, 'Potrebno je unijeti OIB').regex(/^\d+$/, 'OIB mora sadržavati samo znamenke').min(11, 'OIB sadrži točno 11 znamenaka!').max(12, 'OIB sadrži točno 11 znamenaka!'),
	name: z.string().min(1, 'Potrebno je upisati ime').max(100),
	surname: z.string().min(1, 'Potrebno je upisati prezime').max(100),
	birth_date: z.string().min(1, 'Potrebno je unijeti datum rođenja'),
	street: z.string().min(1, 'Potrebno je upisati ulicu').max(100),
	house_number: z.string().min(1, 'Potrebno je upisati kućni broj').regex(/^\d+[A-Za-z]?$/, 'Unesen je neispravan oblik kućnog broja').max(100),
	place: z.string().min(1, 'Potrebno je upisati mjesto prebivališta').max(100),
	town: z.string().min(1, 'Potrebno je upisati naziv općine/grada').max(100),
	username: z.string().min(1, 'Potrebno je upisati korisničko ime').max(100),
	email: z.string().min(1, 'Potrebno je upisati adresu e-pošte').email('Neispravno upisana adresa-e pošte'),
	password: z.string().min(1, 'Potrebno je unijeti lozinku').min(7, 'Lozinka mora imati barem 8 znakova'),
	confirmPassword: z.string().min(1, 'Potrebno je ponovno unijeti lozinku')
})
.refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Lozinka nije točna' })

const emptyForm : z.infer<typeof formSchema> = { pin: '', name: '', surname: '', birth_date: '', street: '', house_number:'', place: '', town: '', username: '', email: '', password: '', confirmPassword: '' }

const SignUpForm = () => {
	const session = useSession()
	if (session.data) window.location.href = '/'

	const [signUpSuccess, setSignUpSuccess] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [signUpAttemptOccurred, setSignUpAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)
	const router = useRouter()
	const { register, handleSubmit, reset, formState: {errors}} = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues:  emptyForm})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		isLoading(true)
		const {house_number, confirmPassword, ...rest} = values
		const response = await fetch('/api/user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({house_number: house_number.toUpperCase(), ...rest})
		})
		
		const message: serverResponse = (await response.json())
		isLoading(false)
		setServerMessage(message.message)
		if (response.ok) {
			reset()
			setSignUpSuccess(true)
			setSignUpAttemptOccurred(true)
			router.push('/prijava')
		} else {
			console.error('Registracija nije moguća. ' + message.message)
			setSignUpAttemptOccurred(true)
		}
	}

	if(loading) return <Loading message='Molim pričekajte. Sustav pokušava izraditi korisnički račun...' />
	else if(signUpSuccess) return <Loading bold={true} color='green' message={`${serverMessage} Pričekajte da Vas preusmjerimo na stranicu za prijavu.`} />
	else return (
				<div className='formContainer'>
					<form onSubmit={handleSubmit(onSubmit)} className='signUpForm'>
						<h3>Registracija</h3>
						{!signUpSuccess && <b className='formErrorMessage'>{serverMessage}</b>}
						<label htmlFor='pin'>OIB</label>
						<input type='text' {...register('pin')} />
						{errors.pin && <b className='formErrorMessage'>{errors.pin.message}</b>}
						<label htmlFor='name'>Ime</label>
						<input type='text' {...register('name')} />
						{errors.name && <b className='formErrorMessage'>{errors.name.message}</b>}
						<label htmlFor='surname'>Prezime</label>
						<input type='text' {...register('surname')} />
						{errors.surname && <b className='formErrorMessage'>{errors.surname.message}</b>}
						<label htmlFor='birth_date'>Datum rođenja</label>
						<input type='date' {...register('birth_date')} />
						{errors.birth_date && <b className='formErrorMessage'>{errors.birth_date.message}</b>}
						<div className='inlineInputs'>
							<div id='street'>
								<label htmlFor='street'>Ulica</label>
								<input type='text' {...register('street')} />
							</div>
							<div id='house-number'>
								<label htmlFor='house_number'>Kućni broj</label>
								<input type='text' {...register('house_number')} />			
							</div>
						</div>
						{errors.street && <b className='formErrorMessage'>{errors.street.message}</b>}
						{errors.house_number && <b className='formErrorMessage'>{errors.house_number.message}</b>}
						<div className='inlineInputs'>
							<div>
								<label htmlFor='place'>Mjesto</label>
								<input type='text' {...register('place')} />
								{errors.place && <b className='formErrorMessage'>{errors.place.message}</b>}
							</div>
							<div>
								<label htmlFor='town'>Općina/grad</label>
								<input type='text' {...register('town')} />
								{errors.town && <b className='formErrorMessage'>{errors.town.message}</b>}
							</div>
						</div>
						<label htmlFor='username'>Korisničko ime</label>
						<input type='text' {...register('username')} />
						{errors.username && <b className='formErrorMessage'>{errors.username.message}</b>}
						<label htmlFor='email'>Adresa e-pošte</label>
						<input type='text' {...register('email')} />
						{errors.email && <b className='formErrorMessage'>{errors.email.message}</b>}
						<label htmlFor='password'>Lozinka</label>
						<input type='password' {...register('password')} />
						{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
						<label htmlFor='confirmPassword'>Ponovo unesite lozinku</label>
						<input type='password' {...register('confirmPassword')} />
						{errors.confirmPassword && <b className='formErrorMessage'>{errors.confirmPassword.message}</b>}
						<div className='buttonContainer'>
							<button type='submit' onClick={() => {signUpAttemptOccurred && setSignUpAttemptOccurred(false) }} className='formSubmitButton'>Registracija</button>
							<button type='reset' onClick={() => reset()} className='resetButton'>Odustani</button>
						</div>
					</form>
					<div className='loginLinkContainer'>
						<p>Već imate korisnički račun?</p>
						<Link href='/prijava'><b>Prijava</b></Link>
					</div>
				</div>
	);
}
export default SignUpForm; 