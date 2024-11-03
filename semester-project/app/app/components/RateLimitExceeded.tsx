import BorderedLink from "./BorderedLink/button";

export default function RateLimitExceeded({rate}:{rate: number}) {
	return (
		<div className="responsiveContainer unavalible">
			<h2>Već ste {rate > 1 ? rate + ' puta' : '' } ispunili obrazac.</h2>
			<p className='errorInfo'>	Nemate pravo ponovo ispuniti obrazac.</p>
			<BorderedLink href='/usluge?_page=1&_limit=10'>Natrag na usluge</BorderedLink>
		</div>
	)
}