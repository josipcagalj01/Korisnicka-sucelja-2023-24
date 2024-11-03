import { Metadata } from "next"
import { Error404 } from "../../../components/error/errorXYZ"
import { Suspense } from "react"
import Loading from "../../../components/Loading/loading"
import { getSubmission, getSubmissionDepartmentId } from "../../../../lib/db_qurery_functions"
import { EmployeesOnly, ParticularDepartmentOnly } from "../../../components/wrappers"
import styles from '../../submissionsStyle.module.css'
import Link from "next/link"
import { Field } from "../../../../lib/configureFormLib"
import { isSet } from "../../../../lib/renderFormLib"
import Image from "next/image"
import '../../../components/services/servicesFormStyle.css'
import PopUp from "../../../components/pop-up"

interface Params {
	submissionId: string
}

export const generateMetadata = async ({ params }: { params: Params}): Promise<Metadata> => {
	const id = parseInt(params.submissionId)
	if (Number.isNaN(id)) return { title: 'Greška' }
	const submission = await getSubmission(id);
	if (!submission) return { title: 'Greška' }
	else return { title: 'Pregled prijave br. ' + id + ' za ' + submission.form.title }
}

export default async function ParticularSubmission({params}: {params:Params}) {
	const id = parseInt(params.submissionId)
	if(isNaN(id)) return(<main><EmployeesOnly><Error404/></EmployeesOnly></main>)
	else {
		const department_id = await getSubmissionDepartmentId(id)
		return (
			<main>
				<ParticularDepartmentOnly id={department_id || 0}>
					<Suspense fallback={<Loading message="Prijava se učitava..."/>}>
						<Render params={params}/>
					</Suspense>
				</ParticularDepartmentOnly>
			</main>
	)}
}

function Bullet() {
	return (<div><div style={{height: '9px', aspectRatio: 1, backgroundColor: 'rgba(0,0,0,0.6)', marginTop: '6px', marginBottom: '7px'}}></div></div>)
}

async function Render({params}: {params:Params}) {
	const {id, time, user, form, data, ordinal} = await getSubmission(parseInt(params.submissionId)) || {id:null, time: null , user: null, form: null, data: null}
	if(!(id || time || user || form || data)) return (<Error404/>)
	else {
		return (
			<section className={styles.submission} id='head'>
				<h1 className={styles.h1}>Pregled prijave za:</h1>
				<h2>{form.title}</h2>
				<section>
					<h2 className={styles.h2}>Podaci o prijavi</h2>
					<div className={styles.labelAndValue}>
						<p>Redni broj prijave</p>
						<b>{ordinal}</b>
					</div>
					<div className={styles.labelAndValue}>
						<p>Vrsta obrasca</p>
						<b>{form.category.name}</b>
					</div>
					<div className={styles.labelAndValue}>
						<p>Vrijeme podnošenja</p>
						<b>{time.toLocaleDateString()} {time.toLocaleTimeString('hr-HR', {timeZone: 'Europe/Zagreb'})}</b>
					</div>
				</section>
				<section>
					<h2 className={styles.h2}>Podaci o podnositelju</h2>
					<div className={styles.labelAndValue}>
						<p>OIB</p>
						<b>{user.pin}</b>
					</div>
					<div className={styles.labelAndValue}>
						<p>Ime i prezime</p>
						<b>{user.name} {user.surname}</b>
					</div>
					<div className={styles.labelAndValue}>
						<p>Datum rođenja</p>
						<b>{user.birth_date.toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb'})}</b>
					</div>
					<div className={styles.labelAndValue}>
						<p>Adresa</p>
						<b>{user.street} {user.house_number}, {user.place} ({user.town})</b>
					</div>
					<div className={styles.labelAndValue}>
						<p>Adresa e-pošte</p>
						<b><Link href={'mailto: ' + user.email}>{user.email}</Link></b>
					</div>
				</section>
				<section>
					<h2 className={styles.h2}>Sadržaj prijavnice</h2>
					{(form.fields as Field[]).map((field, index, fields)=> shouldRender(index, fields, data) &&
						<div className={styles.labelAndValue} key = {field.label}>
							<p>{field.label}</p>
							{['text', 'pin', 'email', 'radio', 'number'].includes(field.inputType) && <b>{isSet((data as any)[`a${index}`]) ? (data as any)[`a${index}`] : '/'}</b>}
							{field.inputType === 'date' && <b>{isSet((data as any)[`a${index}`]) ? new Date((data as any)[`a${index}`]).toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb'}) : '/'}</b>}
							{field.inputType==='checkbox' &&
								<ul className={styles.ul}>
									{(data as any)[`a${index}`].map((value: string)=><li key={value}><Bullet/><b>{value}</b></li>)}
								</ul>
							}						
							{field.inputType==='file' &&
								<>
									{
										(data as any)[`a${index}`]?.length ?
											<ul className={styles.ul}>
											{((data as any)[`a${index}`] as {id: number, name: string}[]).map(({id, name})=> <li key={name}><Bullet/><PopUp fileName={name} url={'/api/datoteka/prijave/' + id}/></li> )}
											</ul>
											:
											<b>/</b>
									}
								</>
							}
						</div>
					)}
				</section>
			</section>
		)
	}
}

function shouldRender(index: number, fields: Field[], data:any) : boolean {
	let returnvalue = false
	let statisfied:number = 0
	if(!fields[index].render.conditional) return true
	else {
			fields[index].render.dependencies.map((dependency)=>{
				const i = fields.map(({label})=>label).indexOf(dependency.label)
				const watchingItem = data[`a${i}`]
				if(Array.isArray(watchingItem)) {
					dependency.values.map((value)=>{
						if(watchingItem.includes(value)) {
							if(fields[index].render.statisfyAll) ++statisfied
							else returnvalue = true; 
							return
						}
					})
				}
				else {
					if(dependency.values.includes(watchingItem)) {
						if(fields[index].render.statisfyAll) ++statisfied
						else returnvalue = true; 
						return
					}
				}
			})	
	}
	if(fields[index]?.render.statisfyAll) {
		return statisfied===fields[index].render.dependencies.length
	}
	else return returnvalue
}

function RenderFile({fileName, formId, submissionId, category, department}: {fileName:string, formId: number, submissionId: number, category: string, department: string}) {
	let fileType: string = ''
	const extension : string = fileName.split('.').slice(-1)[0]
	if(extension.startsWith('doc')) fileType='doc'
	else if (extension==='pdf') fileType='pdf'
	else if(['png','jpg','jpeg'].includes(extension)) fileType='image'
	else if(['zip', '7z'].includes(extension)) fileType = 'archive'
	else if(extension.startsWith('xls')) fileType='xls'
	else fileType='unknown'
	
	return (
		<div className={styles.attachmentAndLink}>
			{fileType==='pdf' && <embed className={styles.desktop} src={'/api/datoteka/prijave/' + category + '/'+ department + '/'  + formId + '/' + submissionId + '/' + fileName + '?zoom=100'} width="100%" height="600px"/>}
			{fileType === 'image' &&
				<div className={styles.imageContainer + ' ' + styles.desktop}>
					<embed src={'/api/datoteka/prijave/' + category + '/'+ department + '/'  + formId + '/' + submissionId + '/' + fileName} style={{width:'80ch'}}/>
				</div> 
			}
			<div className={styles.fileLink}>
				<PopUp fileName={fileName} url= {'/api/datoteka/prijave/' + category + '/'+ department + '/'  + formId + '/' + submissionId + '/' + fileName + 'target="_blank"'}/>
				<figure><Image src={'/file-type-icons/' + fileType + '-filetype-icon.png'} fill={true} sizes="17px" alt='fileType' style={{objectFit: 'contain'}}/></figure>
				<Link href={'/api/datoteka/prijave/' + category + '/'+ department + '/'  + formId + '/' + submissionId + '/' + fileName} target="_blank">{fileName}</Link>
			</div>
		</div>
	)
}