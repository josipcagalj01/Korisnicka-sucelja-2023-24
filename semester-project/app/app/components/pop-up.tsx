'use client'
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import styles from '../prijave/submissionsStyle.module.css'
import ClickAwayListener from "@mui/material/ClickAwayListener"
import DeleteIcon from "./delete-icon/delete-icon"

export default function PopUp({fileName, url}: {fileName: string, url: string}) {
	const [showPopUp, shouldShowPopUp] = useState(false)

	let fileType: string = ''
	const extension : string = fileName.split('.').slice(-1)[0]
	if(extension.startsWith('doc')) fileType='doc'
	else if (extension==='pdf') fileType='pdf'
	else if(['png','jpg','jpeg'].includes(extension)) fileType='image'
	else if(['zip', '7z'].includes(extension)) fileType = 'archive'
	else if(extension.startsWith('xls')) fileType='xls'
	else fileType='unknown'

	const handleClickAway = () => {
		if(showPopUp) shouldShowPopUp(false);
	}

	const embed : boolean = ['image', 'pdf', 'text'].includes(fileType)
	return (
		<>
			{showPopUp && embed &&
			<div style={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 5}} className={styles.popUpContainer}>
				<div>
					<ClickAwayListener onClickAway={handleClickAway}>
						<div className={styles.popUp}>
							<div className={styles.popUpHeader}>
								<div className={styles.fileLink}>
									<figure><Image src={'/file-type-icons/' + fileType + '-filetype-icon.png'} fill={true} sizes="17px" alt='fileType' style={{ objectFit: 'contain' }} /></figure>
									<Link href={url} target="_blank">{fileName}</Link>
								</div>
								<DeleteIcon onClick={()=>{ shouldShowPopUp(false)}}/>
							</div>
							{fileType === 'pdf' && <embed src={url + '?zoom=100'} width="1140px" height="600px" />}
							{['image', 'text'].includes(fileType) &&
								<div className={styles.imageContainer + ' ' + styles.desktop}>
									<embed src={url} width="1123px" type="image/jpeg"/>
								</div>
							}
						</div>
					</ClickAwayListener>
				</div>
			</div>
			}
			{embed &&
				<button type="button" onClick={()=>{shouldShowPopUp(true);}} className={styles.desktop}>
					<div className={styles.fileLink}>
						<figure><Image src={'/file-type-icons/' + fileType + '-filetype-icon.png'} fill={true} sizes="17px" alt='fileType' style={{objectFit: 'contain'}}/></figure>
						<b>{fileName}</b>
					</div>
				</button>

			}
			<div className={styles.fileLink + ' ' + (embed ? styles.mobile : '')}>
				<figure><Image src={'/file-type-icons/' + fileType + '-filetype-icon.png'} fill={true} sizes="17px" alt='fileType' style={{objectFit: 'contain'}}/></figure>
				<Link href={url} target="_blank"><b>{fileName}</b></Link>
			</div>
		</>
	)
}