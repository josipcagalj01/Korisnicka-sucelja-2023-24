import BorderedLink from "../BorderedLink/button";
import { urlQuery } from "../pages-navigation/PagesNavigation";
import styles from './styles.module.css'

export default function SeartchByFirstLetter({label, className='', basePath, query, param, current}: {label:string, className?:string, basePath: string, query: urlQuery, param: '_namestart' | '_surnamestart', current?:string}) {
	const alphabet = ['A', 'B', 'C', 'Č', 'Ć', 'D', 'Dž', 'Đ', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'Lj', 'M', 'N', 'Nj', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ž']
	const {_namestart, _surnamestart, ...rest} = query
	let additional : urlQuery = {}
	if(param==='_namestart') additional._surnamestart = _surnamestart
	else additional._namestart = _namestart

	return (
		<div className={styles.alphabetMenuWrapper}>
			<b>{label}</b>
			<div className={styles.alphabetMenu + ' ' + className}>
				<BorderedLink href={{pathname: basePath, query:{...rest, ...additional}}} className={`${styles.borderedLink} ${!current ? 'current' : ''}`}>Sve</BorderedLink>
				{alphabet.map((letter)=>{
					let a : any = {}
					a[param] = letter
					return <BorderedLink href={{pathname: basePath, query:{...rest, ...additional, ...a}}} className={`${styles.borderedLink} ${current===letter ? 'current' : ''}`} key={letter}>{letter}</BorderedLink>
				})}
			</div>
		</div>
	)
}