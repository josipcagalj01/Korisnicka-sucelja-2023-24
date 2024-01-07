import * as React from 'react';
import spinner from 'public/spinner.gif'
import './loadingStyle.css'

interface loadingProps {
	whatIsLoading: string
}

export default function Loading (props: loadingProps) {
    return (
		<div className='loadingSpinnerContainer'>
			<img src={spinner.src} className='spinner'alt='ucitavanje'/>
			<p className='loadingMessage'>{props.whatIsLoading} se učitavaju</p>
		</div>
	)
}