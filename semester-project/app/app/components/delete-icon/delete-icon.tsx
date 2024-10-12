'use client'
import styles from './deleteIconStyle.module.css'

export default function DeleteIcon({size='15px', className='', onClick}:{size?: string, className?: string, onClick?:React.MouseEventHandler<HTMLButtonElement>}) {
	return (
		<button type='button' id={styles.deleteicon} className={className} onClick={onClick} style={{height: size}}>
			<div id={styles.first} style={{width: 'calc(size * 1.4142 - 3px)'}}></div>
			<div id={styles.second} style={{width: 'calc(size * 1.4142 - 3px)'}}></div>
		</button>
	)
}