'use client'
import Image from "next/image"
import { Form } from "../../../lib/manage-announcments/add-update-announcment-lib"
import { Control } from "react-hook-form"
import { useState, useContext } from "react"
import styles2 from '../form-managment/thumbnail-menu/thumbnail-menuStyle.module.css'
import { RadioNumberInput } from "./special-inputs"
import { ManageAnnouncmentContext } from "../../context/manage-announcment-context"
import { Navigation } from "../form-managment/thumbnail-menu/thumbnail-menu"

export default function ThumbnailMenu({control, current}: {control: Control<Form>, current: number}) {
	const [page, setPage] = useState(1)
	const {thumbnails} = useContext(ManageAnnouncmentContext) || {thumbnails: []}
	
	const totalPages = thumbnails?.length ? Math.ceil(thumbnails.length / 12) : 1

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
								<Image alt={name} src={'/api/datoteka/obavijesti/minijature/' + id} sizes="200px" fill={true} style={{ objectFit: 'cover' }} />
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