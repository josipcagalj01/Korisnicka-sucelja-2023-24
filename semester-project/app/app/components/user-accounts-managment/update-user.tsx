'use client'
import {useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {useState} from 'react'
import BorderedLink, {BorderedButton} from '../BorderedLink/button'
import ActionResultInfo from '../actionResultInfo/actionResultInfo'
import Loading from '../Loading/loading'
import { formSchema, UpdateUserForm, changesExist } from '../../../lib/manage-users/updateUserLib'
import { User } from '../../../lib/manage-users/manage-users'
//import './signUpFormStyle.css'
import '../services/servicesFormStyle.css'

export default function UpdateUser({user, roles, departments}: {user: User, roles: {id: number, name: string}[], departments: {id: number, name: string}[]}) {
	const [success, setSuccess] = useState(false)
	const [serverMessage, setServerMessage] = useState('Inicijalizacija u tijeku. Molim pričekajte.')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)

	const {id, pin, role, department, birth_date, ...rest1} = user

	const defaultValues = {password: '', role_id: role.id, ...rest1, department_id: department?.id || 0}
	const { register, handleSubmit, reset, formState: {errors}, watch, setValue} = useForm<UpdateUserForm>({ resolver: zodResolver(formSchema), defaultValues:  defaultValues})

	const values = watch()

	if(values.role_id===2 && values.department_id) setValue('department_id', 0)

	async function onSubmit(values: UpdateUserForm) {
		setServerMessage('Molim pričekajte. Sustav pokušava spremiti načinjene izmjene...')
		isLoading(true)
		if(!changesExist(defaultValues, values)) {
			isLoading(false)
			return
		}
		else {
			const {department_id, ...rest} = values
			const response = await fetch('/api/update-user', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify({id: id, department_id: department_id ? department_id : null, ...rest})
			})
			const {message} = await response.json()
			setServerMessage(message)
			isLoading(false)
			if(response.ok) {
				setAttemptOccurred(true)
				setSuccess(true)
			}
			else {
				console.error('Nije moguće promijeniti osobitosti korisničkog računa.')
				setAttemptOccurred(true)
			}
		}
	}

	if(loading) return <Loading message={serverMessage} />
	else if(attemptOccurred) return (
		<div className='afterServiceRequestInfo'>
			<ActionResultInfo ok={success} message={serverMessage} />
			<div>
				<BorderedLink href='/upravljanje-sustavom/upravljanje-korisnicima?_page=1&_limit=24'>Povratak na popis korisnika</BorderedLink>
				<BorderedLink href='/moja-stranica'>Povratak osobnu stranicu</BorderedLink>
				{!success &&
					<BorderedButton onClick={() => { setAttemptOccurred(!attemptOccurred); setSuccess(false)}}>
						Pokušaj ponovo
					</BorderedButton>
				}
			</div>
		</div>
	)
	else return (
		<div className='serviceFormContainer'>
			<form className='serviceForm' onSubmit={handleSubmit(onSubmit)}>
				<h3>Profil korisnika</h3>
				{!success && attemptOccurred && <b className='formErrorMessage'>{serverMessage}</b>}
				<div className='inlineInputs'>
					<div className='labelAndInputContainer'>
						<label htmlFor='pin'>OIB</label>
						<p className='fakeInput'>{user.pin}</p>
					</div>
					<div className='labelAndInputContainer'>
						<label htmlFor='birth_date'>Datum rođenja</label>
						<p className='fakeInput'>{birth_date.toLocaleDateString()}</p>
					</div>
				</div>
				<div className='inlineInputs'>
					<div id='name' className='labelAndInputContainer'>
						<label htmlFor='name'>Ime</label>
						<input type='text' {...register('name')}/>
					</div>
					<div id='surname' className='labelAndInputContainer'>
						<label htmlFor='surname'>Prezime</label>
						<input type='text' {...register('surname')}/>
					</div>
				</div>
				<div className='inlineInputs'>
					<div className='labelAndInputContainer'>
						<label htmlFor='place'>Mjesto</label>
						<input type='text' {...register('place')}/>
						{errors.place && <b className='formErrorMessage'>{errors.place.message}</b>}
					</div>
					<div className='labelAndInputContainer'>
						<label htmlFor='place'>Općina/grad</label>
						<input type='text' {...register('town')}/>
						{errors.town && <b className='formErrorMessage'>{errors.town.message}</b>}
					</div>
				</div>
				<div className='inlineInputs'>
					<div className='labelAndInputContainer'>
						<label htmlFor='street'>Ulica</label>
						<input type='text' {...register('street')}/>
						{errors.street && <b className='formErrorMessage'>{errors.street.message}</b>}
					</div>
					<div className='labelAndInputContainer' id='house-number'>
						<label htmlFor='house_number'>Kućni broj</label>
						<input type='text' {...register('house_number')}/>
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
						{roles.map((role)=> <option key={role.name} value={role.id}>{role.name}</option>)}
						{errors.role_id && <b className='formErrorMessage'>{errors.role_id.message}</b>}
					</select>
				</div>
				<div className={`labelAndInputContainer ${values.role_id===2 ? 'disabled' : ''}`}>
					<label htmlFor='role_id'>Odjel</label>
					<select {...register('department_id', { valueAsNumber: true })} value={values.department_id || 0}>
						<option value={0} className='displayNone'></option>
						{departments.map(({id, name})=> <option key={name} value={id}>{name}</option>)}	
					</select>
					{errors.department_id && <b className='formErrorMessage'>{errors.department_id.message}</b>}
				</div>
				<div className='labelAndInputContainer'>
					<label htmlFor='password'>Lozinka (Ostavite prazno ako NE želite promijeniti lozinku ovog korisnika!)</label>
					<input type='password' {...register('password')} autoComplete="new-password"/>
					{errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
				</div>	
				<div className='buttonContainer'>
					<button type='submit' onClick={() => { attemptOccurred && setAttemptOccurred(false) }} className={`formSubmitButton ${!changesExist(defaultValues, values) ? 'disabled' : ''}`}>Spremi promjene</button>
					<button type='button' onClick={() => reset()} className='resetButton'>Odustani</button>
				</div>
			</form></div>
		
	)
}