'use client'
import { UseFormSetValue, UseFormWatch, UseFormGetValues } from "react-hook-form"
import { Form } from '../../../../lib/manage-announcments/add-update-announcment-lib'
import Image from "next/image"
import DeleteIcon from "../../delete-icon/delete-icon"
import Link from "next/link"
import styles from '../../form-managment/file-input/fileInputStyle.module.css'
import { fileTypes } from "../../../../lib/configureFormLib"
import { ManageAnnouncmentContext } from "../../../context/manage-announcment-context"
import { useContext } from "react"

function FileList({setValue, watch, whatToWatch, onDrop }: {setValue: UseFormSetValue<Form>, watch: UseFormWatch<Form>, whatToWatch: any, onDrop?: React.DragEventHandler<HTMLDivElement>}) {
	const watchingItem = watch(whatToWatch)
	let fileType=''
	const extension : string = watchingItem?.name.split('.').slice(-1)[0]
	let nameToDisplay = watchingItem?.name.slice(0, watchingItem?.name.length -  extension.length - 1)
	if(nameToDisplay?.length>10) nameToDisplay = nameToDisplay?.slice(0,10) + '...' + extension
	else nameToDisplay = watchingItem?.name

	if(extension?.startsWith('doc')) fileType='doc'
	else if (extension==='pdf') fileType='pdf'
	else if(['png','jpg','jpeg'].includes(extension)) fileType='image'
	else if(['zip', '7z'].includes(extension)) fileType = 'archive'
	else if(extension?.startsWith('xls')) fileType='xls'
	else fileType='unknown'

	return (
		<div className={styles.uploadedFilesList + ' uploadedFilesList'} onDrop={onDrop} onDragOver={(e)=>e.preventDefault()}>
			{!watchingItem ? <p>Da biste priložili datoteku/e kliknite na gumb „Odabir datoteke“  ili je prenesite mišem u ovo polje.</p> :
			
					<div className={styles.uploadedFileCard + ' uploadedFileCard'} key={watchingItem.name}>
						<DeleteIcon onClick={()=>{setValue(whatToWatch,undefined)}} className="deleteicon"/>
						<Link href={URL.createObjectURL(watchingItem)} target='_blank'>
						{fileType === 'image' ?
							<figure className={styles.imageAttachment}>
								<Image src={URL.createObjectURL(watchingItem)} alt={extension} fill={true} sizes='200px' style={{ objectFit: 'cover' }}/>
							</figure> :
							<figure>
								<Image src={`/file-type-icons/${fileType}-filetype-icon.png`} alt={extension} fill={true} sizes='64px' style={{ objectFit: 'contain' }}/>
							</figure>
						}
							<p>{nameToDisplay}</p>
						</Link>
					</div>
				}
		</div>
	)
}

function MultipleFileList({announcmentId, attached, watch, setValue, onDrop}: {announcmentId?:number, attached: number[], watch: UseFormWatch<Form>, setValue: UseFormSetValue<Form>, onDrop?: React.DragEventHandler<HTMLDivElement>}) {
	const watchingItem = watch('attachments')
	const {existingAttachments} = useContext(ManageAnnouncmentContext) || {existingAttachments : null}
	return (
		<div className={styles.uploadedFilesList + ' uploadedFilesList'} onDrop={onDrop} onDragOver={(e)=>e.preventDefault()}>
			{attached?.length===0 && watchingItem?.length===0 ? 
				<p>Da biste priložili datoteku/e kliknite na gumb „Odabir datoteka“  ili ih prenesite mišem u ovo polje.</p> :
				<>
					{existingAttachments?.filter(({id})=>attached?.includes(id)).map(({id, name})=>{
						let fileType=''
						const extension : string = name.slice(name.lastIndexOf('.')+1, name.length).toLowerCase()
						let nameToDisplay = name.slice(0, name.lastIndexOf('.'))
						if(nameToDisplay.length>10) nameToDisplay = nameToDisplay.slice(0,10) + '...' + extension
						else nameToDisplay = name
						if(extension.startsWith('doc')) fileType='doc'
						else if (extension==='pdf') fileType='pdf'
						else if(['png','jpg','jpeg'].includes(extension)) fileType='image'
						else if(['zip', '7z'].includes(extension)) fileType = 'archive'
						else if(extension.startsWith('xls')) fileType='xls'
						else fileType='unknown'
						return (
							<div className={styles.uploadedFileCard + ' uploadedFileCard'} key={name}>
								<Image src='/red-x.png' alt='deleteicon' height={15} width={15} className='deleteicon' onClick={()=>{setValue('existing_attachments',attached.filter(a=>a!==id))}}/>
								<Link href={'/api/datoteka/obavijesti/' + announcmentId + '/privitci/' + id} target='_blank'>
								<figure>
									<Image src={`/file-type-icons/${fileType}-filetype-icon.png`} alt={extension} fill={true} sizes='64px' style={{ objectFit: 'contain' }}/>
								</figure>
									<p>{nameToDisplay}</p>
								</Link>
							</div>
						)
					})}
					{watchingItem?.map((file: File, index:number) =>{
						let fileType=''
						const extension : string = file.name.slice(file.name.lastIndexOf('.')+1, file.name.length).toLowerCase()
						let nameToDisplay = file.name.slice(0, file.name.lastIndexOf('.'))
						if(nameToDisplay.length>10) nameToDisplay = nameToDisplay.slice(0,10) + '...' + extension
						else nameToDisplay = file.name
						if(extension.startsWith('doc')) fileType='doc'
						else if (extension==='pdf') fileType='pdf'
						else if(['png','jpg','jpeg'].includes(extension)) fileType='image'
						else if(['zip', '7z'].includes(extension)) fileType = 'archive'
						else if(extension.startsWith('xls')) fileType='xls'
						else fileType='unknown'
						return (
							<div className={styles.uploadedFileCard + ' uploadedFileCard'} key={file.name}>
								<Image src='/red-x.png' alt='deleteicon' height={15} width={15} className='deleteicon' onClick={()=>{setValue('attachments',Array.from(watchingItem).filter((_,i)=>i!=index))}}/>
								<Link href={URL.createObjectURL(file)} target='_blank'>
								<figure>
									<Image src={`/file-type-icons/${fileType}-filetype-icon.png`} alt={extension} fill={true} sizes='64px' style={{ objectFit: 'contain' }}/>
								</figure>
									<p>{nameToDisplay}</p>
								</Link>
							</div>
						)})}
					</>
				}
		</div>
	)
}

export default function ThumbnailInput({watch, setValue, getValues, field, multiple, disabled }: {watch: UseFormWatch<Form>, setValue:UseFormSetValue<Form>, getValues: UseFormGetValues<Form>, field: any, multiple?: boolean, disabled?:boolean }) {
	const watchingItem = watch(field)

	function appendFiles(e:React.ChangeEvent<HTMLInputElement>) {
		if(e.currentTarget.files) {
			setValue(field, e.currentTarget.files[0], {shouldValidate:true})
			setValue('thumbnail_id', 0)
		}
	}
	return (
		<>
			<FileList whatToWatch={field} setValue={setValue} watch={watch} onDrop={(e)=>{e.preventDefault(); setValue(field, Array.from(e.dataTransfer.files)[0])}}/>
			<input type='file' title='Naslovna slika' name={field} disabled={(disabled || watchingItem) && !multiple}  onChange={(e)=>appendFiles(e)}/>
		</>
	)
}

export function AttachmentInput({announcmentId, existingAttachments, watch, setValue, getValues, field }: {announcmentId?:number, existingAttachments: number[], watch: UseFormWatch<Form>, setValue:UseFormSetValue<Form>, getValues: UseFormGetValues<Form>, field: any}) {
	function appendFiles(e:React.ChangeEvent<HTMLInputElement>) {
		if(e.currentTarget.files) setValue(field, Array.from(e.currentTarget.files).concat(getValues(field)), {shouldValidate:true})
	}

	return (
		<>
			<MultipleFileList announcmentId={announcmentId} attached={existingAttachments} watch={watch} setValue={setValue} onDrop={(e)=>{e.preventDefault(); setValue('attachments', Array.from(e.dataTransfer.files).concat(getValues('attachments') || []), {shouldValidate: true})}}/>
			<input type='file' name={field} multiple={true} className='multiple' onChange={(e)=>appendFiles(e)} accept={fileTypes.map(({extension})=>'.'+extension).join(', ')}/>
		</>
	)
}