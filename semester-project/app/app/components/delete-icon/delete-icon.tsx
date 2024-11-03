'use client'
import styles from './deleteIconStyle.module.css'

export default function DeleteIcon({size=15, thickness=3, className='', onClick}:{size?: number, thickness?:number, className?: string, onClick?:React.MouseEventHandler<HTMLDivElement>}) {
	const first_translate_Y = Math.ceil(size/2) - Math.ceil(thickness/2)
	const second_translate_Y = first_translate_Y - thickness
	return (
		<div  id={styles.deleteicon}  className={className} onClick={onClick} style={{height: `${size}px`, width: `${size}px`}}>
			<div id={styles.first} style={{height: thickness, transform: `translateY(${first_translate_Y}px) rotate(-45deg)`}}></div>
			<div id={styles.second} style={{height: thickness, transform: `translateY(${second_translate_Y}px) rotate(45deg)`}}></div>
		</div>
	)
}