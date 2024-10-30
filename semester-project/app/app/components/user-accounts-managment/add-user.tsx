'use client'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation'
import '../services/servicesFormStyle.css'
import Loading from '../Loading/loading'
import {emptyForm, formSchema, AddUserForm} from '../../../lib/manage-users/addUserLib'
import ActionResultInfo from '../actionResultInfo/actionResultInfo';
import BorderedLink, {BorderedButton} from '../BorderedLink/button';

interface serverResponse {
	message: string
}

const SignUpForm = ({roles, departments}: {roles: {id: number, name: string}[], departments: {id: number, name: string}[]}) => {
	
	const [success, setSuccess] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)

	const { register, handleSubmit, reset, formState: {errors}, setValue, watch} = useForm<AddUserForm>({ resolver: zodResolver(formSchema), defaultValues:  emptyForm})

	const values = watch()
	if(values.role_id===2 && values.department_id) setValue('department_id', 0)

	const onSubmit = async (values: AddUserForm) => {
		setServerMessage('Molim pričekajte. Sustav pokušava izraditi korisnički račun...')
		isLoading(true)
		
		const response = await fetch('/api/user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(values)
		})
		
		const message: serverResponse = (await response.json())
		isLoading(false)
		setServerMessage(message.message)
		if (response.ok) {
			reset()
			setAttemptOccurred(true)
			setSuccess(true)
			
		} else {
			console.error('Registracija nije moguća. ' + message.message)
			setAttemptOccurred(true)
		}
	}

	if(loading) return <Loading message={serverMessage} />
	else if(attemptOccurred) return (
		<div className='afterServiceRequestInfo'>
			<ActionResultInfo ok={success} message={serverMessage} />
			<div>
				<BorderedLink href='/upravljanje-sustavom/upravljanje-korisnicima?_page=1&_limit=24'>Povratak na popis korisnika</BorderedLink>
				<BorderedLink href='/moja-stranica'>Povratak osobnu stranicu</BorderedLink>
				<BorderedButton onClick={() => { setAttemptOccurred(!attemptOccurred); setSuccess(false)}}>
					{!success ? 'Pokušaj ponovo' : 'Dodaj novog korisnika'}
				</BorderedButton>
			</div>
		</div>
	)
	else return (
		<div className='serviceFormContainer'>
			<form onSubmit={handleSubmit(onSubmit)} className='serviceForm'>
				<div className='inlineInputs'>
					<div className='labelAndInputContainer'>
						<label htmlFor='pin'>OIB</label>
						<input type='text' {...register('pin')} />
						{errors.pin && <b className='formErrorMessage'>{errors.pin.message}</b>}
					</div>
					<div className='labelAndInputContainer'>
						<label htmlFor='birth_date'>Datum rođenja</label>
						<input type='date' {...register('birth_date')} />
						{errors.birth_date && <b className='formErrorMessage'>{errors.birth_date.message}</b>}
					</div>
				</div>
				<div className='inlineInputs'>
					<div id='name' className='labelAndInputContainer'>
						<label htmlFor='name'>Ime</label>
						<input type='text' {...register('name')} />
					</div>
					<div id='surname' className='labelAndInputContainer'>
						<label htmlFor='surname'>Prezime</label>
						<input type='text' {...register('surname')} />
					</div>
				</div>
				<div className='inlineInputs'>
					<div className='labelAndInputContainer'>
						<label htmlFor='place'>Mjesto</label>
						<input type='text' {...register('place')} />
						{errors.place && <b className='formErrorMessage'>{errors.place.message}</b>}
					</div>
					<div className='labelAndInputContainer'>
						<label htmlFor='place'>Općina/grad</label>
						<input type='text' {...register('town')} />
						{errors.town && <b className='formErrorMessage'>{errors.town.message}</b>}
					</div>
				</div>
				<div className='inlineInputs'>
					<div className='labelAndInputContainer'>
						<label htmlFor='street'>Ulica</label>
						<input type='text' {...register('street')} />
						{errors.street && <b className='formErrorMessage'>{errors.street.message}</b>}
					</div>
					<div className='labelAndInputContainer' id='house-number'>
						<label htmlFor='house_number'>Kućni broj</label>
						<input type='text' {...register('house_number')} />
						{errors.house_number && <b className='formErrorMessage'>{errors.house_number.message}</b>}
					</div>
				</div>
				<div className='inlineInputs'>
					<div id='username' className='labelAndInputContainer'>
						<label htmlFor='username'>Korisničko ime</label>
						<input type='text' {...register('username')} />
						{errors.username && <b className='formErrorMessage'>{errors.username.message}</b>}
					</div>
					<div id='email' className='labelAndInputContainer'>
						<label htmlFor='email'>Adresa e-pošte</label>
						<input type='text' {...register('email')} />
						{errors.email && <b className='formErrorMessage'>{errors.email.message}</b>}
					</div>
				</div>
				<div className='labelAndInputContainer'>
					<label htmlFor='role_id'>Vrsta korisnika</label>
					<select {...register('role_id', { valueAsNumber: true })} value={values.role_id}>
						<option value={0} className='displayNone'></option>
						{roles.map((role) => <option key={role.name} value={role.id}>{role.name}</option>)}
						{errors.role_id && <b className='formErrorMessage'>{errors.role_id.message}</b>}
					</select>
				</div>
				<div className={`labelAndInputContainer ${values.role_id===2 ? 'disabled' : ''}`}>
					<label htmlFor='role_id'>Odjel</label>
					<select {...register('department_id', { valueAsNumber: true })} value={values.department_id || 0}>
						<option value={0} className='displayNone'></option>
						{departments.map(({ id, name }) => <option key={name} value={id}>{name}</option>)}
					</select>
					{errors.department_id && <b className='formErrorMessage'>{errors.department_id.message}</b>}
				</div>
				<div className='labelAndInputContainer'>
					<label htmlFor='password'>Lozinka</label>
					<input type='password' {...register('password')} />
					{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
				</div>
				<div className='labelAndInputContainer'>
					<label htmlFor='confirmPassword'>Ponovo unesite lozinku</label>
					<input type='password' {...register('confirmPassword')} />
					{errors.confirmPassword && <b className='formErrorMessage'>{errors.confirmPassword.message}</b>}
				</div>
				<div className='buttonContainer'>
					<button type='submit' onClick={() => { attemptOccurred && setAttemptOccurred(false) }} className='formSubmitButton'>Izradi račun</button>
					<button type='button' onClick={() => reset()} className='resetButton'>Odustani</button>
				</div>
			</form>
		</div>
	);
}
export default SignUpForm; 