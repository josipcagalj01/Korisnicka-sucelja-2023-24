//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import './newsPageStyle.css'
import { Metadata } from 'next'
import { getAnnouncment } from '../../../lib/manage-announcments/db_queries'
import { Suspense } from 'react'
import Loading from '../../components/Loading/loading'
import Image from 'next/image'
import { Error404 } from '../../components/error/errorXYZ'
import Link from 'next/link'
import BorderedLink from '../../components/BorderedLink/button'
import styles from '../../prijave/submissionsStyle.module.css'

interface Params {
	announcmentId: string;
}

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
	const id = parseInt(params.announcmentId)
	if (Number.isNaN(id)) return { title: 'Greška' }
	const announcment = await getAnnouncment(id);
	if (!announcment) return { title: 'Greška' }
	else return { title: announcment.title }
}

function RenderContent({content}: {content?: any[]}) {
	if(!content || !content.length) return null
	else return (
		content.map((node: any)=>{
			if(node.type==='paragraph') {
				return (
					<p className={'text-align-' + node.attrs?.textAlign} key={Math.random()}>
						<RenderContent content={node.content} />
					</p>
				)
			}
			else if(node.type==='heading') {
				const level = node.attrs?.level
				if(level===1) return (<h1 key={Math.random()} className={'text-align-' + node.attrs?.textAlign}><RenderContent content={node.content}/></h1>)
				else if(level===2) return (<h2 key={Math.random()} className={'text-align-' + node.attrs?.textAlign}><RenderContent content={node.content}/></h2>)
				else if(level===3) return (<h3 key={Math.random()} className={'text-align-' + node.attrs?.textAlign}><RenderContent content={node.content}/></h3>)
				else if(level===4) return (<h4 key={Math.random()} className={'text-align-' + node.attrs?.textAlign}><RenderContent content={node.content}/></h4>)
			}
			else if(node.type === 'text') {
				if(!node.marks) return (<>{node.text}</>)
				else {
					const marks : string[] = node.marks?.map((mark: any)=>mark.type)
					if(marks.length===1) {
						if(marks?.includes('underline')) return <u key={Math.random()}>{node.text}</u>
						else if(marks?.includes('bold')) return <b key={Math.random()}>{node.text}</b>
						else if(marks?.includes('italic')) return <i key={Math.random()}>{node.text}</i>
						else if(marks?.includes('strike')) return <s key={Math.random()}>{node.text}</s>
					}
					else if(marks.length===2) {
						if(['bold', 'italic'].every((word)=>marks?.includes(word))) return (<b key={Math.random()}><i>{node.text}</i></b>)
						else if(['bold', 'strike'].every((word)=>marks?.includes(word))) return (<b key={Math.random()}><del>{node.text}</del></b>)
						else if(['bold', 'underline'].every((word)=>marks?.includes(word))) return (<b key={Math.random()}><u>{node.text}</u></b>)
						else if(['italic', 'strike'].every((word)=>marks?.includes(word))) return (<i key={Math.random()}><del>{node.text}</del></i>)
						else if(['italic', 'underline'].every((word)=>marks?.includes(word))) return (<i key={Math.random()}><u>{node.text}</u></i>)
						else if(['underline', 'strike'].every((word)=>marks?.includes(word))) return (<u key={Math.random()}><del>{node.text}</del></u>)
					}
					else if(marks.length===3) {
						if(['bold', 'strike', 'underline'].every((word)=>marks?.includes(word))) return (<b key={Math.random()}><u><del>{node.text}</del></u></b>)
						else if(['bold', 'strike', 'italic'].every((word)=>marks?.includes(word))) return (<b key={Math.random()}><i><del>{node.text}</del></i></b>)
						else if(['bold', 'italic', 'underline'].every((word)=>marks?.includes(word))) return (<b key={Math.random()}><i><u>{node.text}</u></i></b>)
						else if(['italic', 'strike', 'underline'].every((word)=>marks?.includes(word))) return (<u key={Math.random()}><i><del>{node.text}</del></i></u>)
					}
					else if(marks.length===4) return (<b key={Math.random()}><u><i><del>{node.text}</del></i></u></b>)
				}
			}
			else if(node.type=== 'orderedList') {
				const start:number = node.attrs?.start
				return (<ol key={Math.random()} start={start}><RenderContent content={node.content}/></ol>)
			}
			else if(node.type === 'bulletList') {
				return (<ul key={Math.random()} ><RenderContent content={node.content}/></ul>)
			}
			else if(node.type === 'listItem') return (<li key={Math.random()}><RenderContent content={node.content}/></li>)
			else if(node.type=== 'hardBreak') return <br key={Math.random()}/>

		})
	)
}

async function RenderAnnouncment(params: Params) {
	const id = parseInt(params.announcmentId)

	if (Number.isNaN(id)) return (<main className='errorMain'><Error404 /></main>)
	else {
		const announcment = await getAnnouncment(id)
		if (!announcment) return (<main className='errorMain'><Error404 /></main>)
		else {
			const noAside = !(announcment.form || announcment.attachments?.length !== 0)
			return (
				<section className={`newsPageWholeContent ${noAside ? ' onlyText' : ''}`}>
					<h1 className='announcmentTitle'>{announcment?.title}</h1>
					<p className='dateAndCategory'>{announcment?.date?.toLocaleDateString('hr-HR', { timeZone: 'Europe/Zagreb' })} | {announcment?.category?.name}</p>
					{announcment?.thumbnail_id && <figure className={`thumbnailWrapper ${noAside ? 'noAside' : ''}`}><Image alt='slika' src={'/api/datoteka/obavijesti/' + announcment.id + '/minijatura'} className='announcmentThumbnail' sizes='1320px' fill={true} style={{ objectFit: 'cover' }} /></figure>}
					<div className={`announcmentContent ${!noAside ? 'showAside' : ''}`}>
						<article className='announcmentContainer'>
							<RenderContent content={(announcment.content as any)?.content} />
						</article>
						{!noAside &&
							<aside className='attachments'>
								<div>
									{announcment.attachments?.length !== 0 &&
										<div className='attachmentsList'>
											<h3>Privitci</h3>
											<ul>
												{announcment.attachments?.map(({ id, name }) => {
													let fileType: string = ''
													const extension: string = name.slice(name.lastIndexOf('.') + 1, name.length)
													if (extension.startsWith('doc')) fileType = 'doc'
													else if (extension === 'pdf') fileType = 'pdf'
													else if (['png', 'jpg', 'jpeg'].includes(extension)) fileType = 'image'
													else if (['zip', '7z'].includes(extension)) fileType = 'archive'
													else if (extension.startsWith('xls')) fileType = 'xls'
													else fileType = 'unknown'
													return (
														<li key={name} className={styles.fileLink}>
															<figure><Image src={'/file-type-icons/' + fileType + '-filetype-icon.png'} fill={true} sizes="17px" alt='fileType' style={{ objectFit: 'contain' }} /></figure>
															<Link href={'/api/datoteka/obavijesti/' + announcment.id + '/privitci/' + id} target='_blank'>{name}</Link>
														</li>
													)
												})}
											</ul>
										</div>
									}
									{announcment.form &&
										<div>
											<h3>e-Obrazac</h3>
											<ul>
												<li>{announcment.form.title}<br /><BorderedLink href={'/usluge/' + announcment.form.id} target='_blank'>{announcment.category.id === 3 ? 'Zatraži uslugu' : 'Podnesi prijavu'}</BorderedLink></li>
											</ul>
										</div>
									}
								</div>
							</aside>
						}
					</div>
				</section>
			)
		}
	}
}

async function Announcment({ params }: { params: Params }) {
	return (
		<main>
			<Suspense fallback={<Loading message='Obavijest se učitava ...' />}>
				<RenderAnnouncment announcmentId={params.announcmentId} />
			</Suspense>
		</main>
	)
}
export default Announcment