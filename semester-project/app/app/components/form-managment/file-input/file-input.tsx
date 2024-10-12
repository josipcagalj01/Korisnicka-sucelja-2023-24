'use client'
import { UseFormSetValue, UseFormWatch, UseFormGetValues } from "react-hook-form"
import { Form } from "../../../../lib/configureFormLib"
import Image from "next/image"
import DeleteIcon from "../../delete-icon/delete-icon"
import Link from "next/link"
import styles from './fileInputStyle.module.css'

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
			{!watchingItem ? <p>Da biste priložili datoteku/e kliknite na gumb „Odabir datoteka“  ili ih prenesite mišem u ovo polje.</p> :
			
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

export default function FileInput({watch, setValue, getValues, field, multiple, disabled }: {watch: UseFormWatch<Form>, setValue:UseFormSetValue<Form>, getValues: UseFormGetValues<Form>, field: any, multiple?: boolean, disabled?:boolean }) {
	const watchingItem = watch(field)

	function appendFiles(e:React.ChangeEvent<HTMLInputElement>) {
		if(e.currentTarget.files) {
			setValue(field, e.currentTarget.files[0], {shouldValidate:true})
			setValue('thumbnail_id', 0)
		}
	}
	return (
		<>
			<FileList whatToWatch={field} setValue={setValue} watch={watch} onDrop={(e)=>{e.preventDefault(); setValue(field, Array.from(e.dataTransfer.files))}}/>
			<input type='file' title={field} name={field} multiple={multiple} disabled={(disabled || watchingItem?.length) && !multiple}  onChange={(e)=>appendFiles(e)}/>
		</>
	)
}