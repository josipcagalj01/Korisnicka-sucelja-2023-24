'use client'

import '../services/servicesFormStyle.css'
import Loading from '../Loading/loading'
import ActionResultInfo from '../actionResultInfo/actionResultInfo'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import BorderedLink, { BorderedButton} from '../BorderedLink/button'
import styles from '../form-managment/template-menu/templateMenuStyle.module.css'
import { useRouter } from 'next/navigation'

export default function DeleteAnnouncment({id}: {id: number}) {
	const {handleSubmit, setValue} = useForm<{id: number}>({defaultValues: {id: id}})

	const [attemptFailed, setAttemptFailed] = useState(false)
	const [serverMessage, setServerMessage] = useState('')
	const [attemptOccurred, setAttemptOccurred] = useState(false)
	const [loading, isLoading] = useState(false)

	useEffect(()=>setValue('id', id), [id])

	const router = useRouter()

	async function onSubmit(values: {id: number}) {
		isLoading(true)
		setAttemptOccurred(true)

		const response = await fetch('/api/obrisi-objavu',{
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(values)
		})
	
		const {message} = await response.json()
		setServerMessage(message)

		if(!response.ok) {
			console.error('Nije moguće ukloniti objavu.')
			isLoading(false)
			setAttemptFailed(true)
		}
	}

	if(loading) return <Loading message='Molim pričekajte. Sustav pohranjuje načinjene izmjene...' />
	else if(attemptOccurred) return (
		<div className='afterServiceRequestInfo'>
			<ActionResultInfo ok={!attemptFailed} message={serverMessage} />
			<div>
				<BorderedLink href='/moj-racun'>Povratak osobnu stranicu</BorderedLink>
				{attemptFailed ?
					<BorderedButton onClick={() => { setAttemptOccurred(!attemptOccurred); setAttemptFailed(false)}}>Pokušaj ponovo</BorderedButton> :
					<BorderedLink href='/objave?_page=1&_limit=15'>Povratak na objave</BorderedLink>		
				}
			</div>
		</div>
	)
	else return (
		<form className={styles.form + ' serviceForm'} onSubmit={handleSubmit(onSubmit)}>
			<section>
				<div className='formSectionContent'>
					<p> Odabirom gumba „Izbriši objavu“ <b style={{ color: 'red' }}>NEPOVRATNO</b> ćete izbrisati ovu objavu, kao i privitke te objave. Da bi nakon toga objava ponovo bila dostupna, potrebno ju je ponovo stvoriti.. </p>
				</div>
			</section>
			<div className='buttonContainer'>
				<button type='submit' className='deleteButton'>Izbriši objavu</button>
				<BorderedButton onClick={() => router.push('/objave?_page=1&_limit=15')}>Odustani</BorderedButton>
			</div>
		</form>
	)
}