import BorderedLink from "../BorderedLink/button";
import './not-foundStyle.css'
import LogInOrOut from "../log-in-or-out/logout";
import { usePathname } from "next/navigation";

export function Error401({callbackUrl, message}:{callbackUrl?:string, message?:string}) {
	const errorMessage = message || 'Vaša sesija je istekla ili je prekinuta. Da biste vidjeli sadržaj stranice ponovo se prijavite.'
	return (
		<div className='responsiveContainer'>
			<div className='errorInfo'>
				<h1 className='errorCode'>401</h1>
				<h1>Greška</h1>
				<p>{errorMessage}</p>
				<BorderedLink href={`/prijava${callbackUrl ? '?callbackUrl='+callbackUrl: '' }`}>Prijava</BorderedLink>
			</div>
		</div>
	)
}

export function Error403({message}: {message?:string}) {
	const path = typeof(window) !== 'undefined' ? usePathname() : ''
	return (
		<div className='responsiveContainer'>
			<div className='errorInfo'>
				<h1 className='errorCode'>403</h1>
				<h1>Greška</h1>
				<p>{message || 'Pristup ovoj stranici omogućen je samo autoriziranim korisnicima. Da biste vidjeli njen sadržaj, prijavite se korisničkim računom povezanim s primjerenom razinom prava.'}</p>
				<LogInOrOut className="logOutButton borderedButton" callbackUrl={path}/>
				<BorderedLink href='/'>Povratak na početnu stranicu</BorderedLink>
			</div>
		</div>
	)
}

export function Error404() {
	return (
		<div className='responsiveContainer'>
			<div className='errorInfo'>
				<h1 className='errorCode'>404</h1>
				<h1>Greška</h1>
				<p>Stranicu koju ste namjeravali posjetiti nije moguće pronaći. Možda je uklonjena ili premještena.</p>
				<BorderedLink href='/'>Povratak na naslovnicu</BorderedLink>
			</div>
		</div>
	)
}