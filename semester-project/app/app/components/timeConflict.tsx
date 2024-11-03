import BorderedLink from "./BorderedLink/button";

export default function TimeConflictCheck({now, from, until, children}: {now: Date, from: Date | null, until: Date | null, children?: React.ReactNode}) {
	let early = false; let late = false
	if(from) early = (from?.getTime() || 0) > now.getTime()
	if(until) late = (until?.getTime() || Date.now()+2) <= now.getTime()
	const timeFormat : any = {hour: "2-digit", minute: "2-digit", timeZone: 'Europe/Zagreb'}
	let criticalDate:Date | null = null
	if(early) criticalDate = from
	else if (late) criticalDate = until
	if(early || late) return (
		<div className="responsiveContainer unavalible">
			<h2>Obrazac {early ? 'se otvara' : 'je zatvoren'} u {criticalDate?.toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb', dateStyle: 'full'})} u {criticalDate?.toLocaleTimeString('HR-hr',timeFormat)}.</h2>
			<p className='errorInfo'>	Nažalost, ovaj obrazac {early ? 'još' : 'više'} nije raspoloživ. </p>
			<BorderedLink href='/usluge?_page=1&_limit=10'>Natrag na usluge</BorderedLink>
		</div>
	)
	else return <>{children}</>
}