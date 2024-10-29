'use client'
import Image from "next/image"
import { Form } from "../../../../lib/configureFormLib"
import { Control } from "react-hook-form"
import { useState, useContext } from "react"
import { BorderedButton } from "../../BorderedLink/button"
import styles from '../../pages-navigation/pagesNavigationStyle.module.css'
import styles2 from './thumbnail-menuStyle.module.css'
import { RadioNumberInput } from "../special-inputs"
import { ManageFormsContext } from "../../../context/manage-forms-context"

export function Navigation({page, totalPages, setPage, className=''}: {page:number, totalPages: number, setPage:React.Dispatch<React.SetStateAction<number>>, className?:string}) {
	return (
		<div className={styles.pagesNavigation + ' ' + className + ' ' + styles2.navigation}>
			<BorderedButton onClick={()=>setPage(1)} disabled={page===1} className={styles.desktop}>
				Prva
			</BorderedButton>
			<BorderedButton onClick={()=>setPage(1)} disabled={page===1} className={styles.mobile + ' ' + styles.back}>
				<Image alt='show-hide-arrow-double.png' src='/arrows/show-hide-arrow-double.png' height={13} width={13}/>
			</BorderedButton>
			<BorderedButton onClick={()=>setPage(page-1)} disabled={page===1} className={styles.desktop}>Prethodna</BorderedButton>
			<BorderedButton onClick={()=>setPage(page-1)} disabled={page===1} className={styles.mobile + ' ' + styles.back}>
				<Image alt='show-hide-arrow.png' src='/arrows/show-hide-arrow.png' height={14} width={8}/>
			</BorderedButton>
			<p>Stranica <br className={styles.mobile}/> {page} od {totalPages}</p>
			<BorderedButton onClick={()=>setPage(page+1)} disabled={page===totalPages} className={styles.desktop}>
				Sljedeća
			</BorderedButton>
			<BorderedButton onClick={()=>setPage(page+1)} disabled={page===totalPages} className={styles.mobile}>
				<Image alt='show-hide-arrow.png' src='/arrows/show-hide-arrow.png' height={14} width={8}/>
			</BorderedButton>
			<BorderedButton onClick={()=>setPage(totalPages)} disabled={page===totalPages} className={styles.desktop}>
				Posljednja
			</BorderedButton>
			<BorderedButton onClick={()=>setPage(totalPages)} disabled={page===totalPages} className={styles.mobile}>
				<Image alt='show-hide-arrow-double.png' src='/arrows/show-hide-arrow-double.png' height={13} width={13}/>
			</BorderedButton>
		</div>
	)
}

	export default function ThumbnailMenu({control, current}: {control: Control<Form>, current: number}) {
	const [page, setPage] = useState(1)
	const {thumbnails} = useContext(ManageFormsContext) || {thumbnails: []}
	let totalPages = 1
	if(thumbnails?.length) {
		totalPages = Math.ceil(thumbnails.length / 12)
	}

	let index = -1
	if(thumbnails) index = thumbnails?.map(({id})=>id).indexOf(current)
	
	const reordered = index !== -1 ? [(thumbnails?.[index] || {name: '', id: 0}), ...(thumbnails?.filter((_,i)=>i!==index) || [])] : (thumbnails || [])

	const offset = (page-1)*12
	let endPosition = offset + 12
	if(endPosition > (thumbnails?.length || 0)) endPosition = thumbnails?.length || 0

	return (
		<div className={styles2.thumbnailMenuFrame + " thumbnailMenuFrame"}>
			<div className={styles2.thumbnailMenu + ' thumbnailMenu'}>
				{thumbnails?.length && <Navigation page={page} totalPages={totalPages} setPage={setPage}/>}
				{reordered.slice(offset, endPosition).map(({id, name}) => {
					const extension: string = name.split('.').slice(-1)[0]
					let nameToDisplay = name.slice(0, name.length - extension.length - 1)
					if (nameToDisplay.length > 10) nameToDisplay = nameToDisplay.slice(0, 10) + '...' + extension
					else nameToDisplay = name
					return (
						<div key={name} className={`${styles2.thumbnailAndInput} + ' ' + ${current === id ? styles2.selected : ''}`}>
							<figure>
								<Image alt={name} src={'/api/datoteka/obrasci/minijature/' + id} sizes="200px" fill={true} style={{ objectFit: 'cover' }} />
							</figure>
							<div className="radioInput">
								<RadioNumberInput name='thumbnail_id' control={control}  number_value={id} onClick={()=>setPage(1)}/>
								<p>{nameToDisplay}</p>
							</div>
						</div>
					)}
				)}
				{thumbnails?.length && <Navigation page={page} totalPages={totalPages} setPage={setPage}/>}
			</div>
		</div>
	)
}