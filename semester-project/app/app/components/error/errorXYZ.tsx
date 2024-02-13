import BorderedLink from "../BorderedLink/button";
import '../../not-foundStyle.css'

export function Error401({callbackUrl}:{callbackUrl:string | undefined}) {
	return (
		<div className='responsiveContainer'>
			<div className='notFoundMessage'>
				<h1 className='errorCode'>401</h1>
				<h1>Greška</h1>
				<p>Vaša sesija je istekla ili prekinuta. Da biste vidjeli sadržaj stranice ponovo se prijavite.</p>
				<BorderedLink href={`/prijava?callbackUrl=${callbackUrl}`} className='A'>Prijava</BorderedLink>
			</div>
		</div>
	)
}

export function Error404() {
	return (
		<div className='responsiveContainer'>
			<div className='notFoundMessage'>
				<h1 className='errorCode'>404</h1>
				<h1>Greška</h1>
				<p>Stranicu koju ste namjeravali posjetiti nije moguće pronaći. Možda je uklonjena ili premještena.</p>
				<BorderedLink href='/' className='A'>Povratak na početnu stranicu</BorderedLink>
			</div>
		</div>
	)
}