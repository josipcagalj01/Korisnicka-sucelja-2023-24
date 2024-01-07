import * as React from 'react';
import spinner from 'public/spinner.gif'
import './loadingStyle.css'



export default function Loading () {
    return (
		<div className='loadingSpinnerContainer'>
			<img src={spinner.src} className='spinner'alt='ucitavanje'/>
			<p className='loadingMessage'>Podaci se učitavaju</p>
		</div>
	)
}