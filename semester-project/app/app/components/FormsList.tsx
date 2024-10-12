import ActionResultInfo from './actionResultInfo/actionResultInfo';
import Link from 'next/link';
import Image from 'next/image';
import { newsProps } from './News/news';
import { getForms, getFormsForEmployees } from '../../lib/db_qurery_functions';
import './News/newsStyle.css'
import styles from '../obrasci/editableFormsStyle.module.css'

export default async function FormsList({ limit, offset, desiredId, category, className }: newsProps) {
	const {count, forms} = await getForms({limit:limit, offset:offset, desiredId:desiredId, category:category})
	if (count === -1) return (<ActionResultInfo message='Dogodila se greška pri učitavanju usluga.' className='margin-top-40px'/>)
	else if (count === 0) return (<h3 className={styles.centerHorizontally}>Još nema dostupnih obrazaca</h3>)
	else {
		return (
			<>
				<div className='AnnouncmentsContainer'>
					{forms.map((form) => {
						//const thumbnailUrl = form.thumbnail_id? `/api/datoteka/public/thumbnails/${form.thumbnail?.name}` : '/bilazgrada.jpg'
						const thumbnailUrl = form.thumbnail_id ? `/api/datoteka/obrasci/${form.id}/minijatura` : '/bilazgrada.jpg'
						return (
							<article className={`announcment ${className ? className : ''}`} key={form.id}>
								<figure className='announcmentImageContainer'>
									<Image src={thumbnailUrl} alt='bilazgrada' fill={true} sizes='220px' style={{ objectFit: 'cover' }} />
								</figure>
								<p className='announcmentInfo'>{form.avalible_from.toLocaleDateString('hr-HR')} | {form.category.name.replace?.('_', ' ')}</p>
								<Link href={'/usluge/' + form.id}>
									<h3 className='announcmentTitle'>{form.title}</h3>
								</Link>
							</article>
						)
					}
				)}
				</div>
			</>
		)
	}
}

export async function FormsList2({ limit, offset, desiredId, category, className }: newsProps) {
	const {count, forms} = await getFormsForEmployees({limit:limit, offset:offset, desiredId:desiredId, category:category})
	if (count === -1) return (<ActionResultInfo message='Dogodila se greška pri učitavanju obrazaca.' />)
	else if (count === 0) return (<h3 className={styles.centerHorizontally}>Nema obrazaca za prikazati</h3>)
	else {
		return (
			<>
				<div className='AnnouncmentsContainer'>
					{forms.map((form) => {
						//const thumbnailUrl = form.thumbnail?.name ? `/api/datoteka/public/thumbnails/${form.thumbnail.name}` : '/bilazgrada.jpg'
						const thumbnailUrl = form.thumbnail_id ? `/api/datoteka/obrasci/${form.id}/minijatura` : '/bilazgrada.jpg'
						return (
							<article className={`announcment ${className ? className : ''}`} key={form.id}>
								<figure className='announcmentImageContainer'>
									<Image src={thumbnailUrl} alt={thumbnailUrl} fill={true} sizes='220px' style={{ objectFit: 'cover' }} />
								</figure>
								<p className='announcmentInfo'>{form.avalible_from.toLocaleDateString('hr-HR')} | {form.category.name.replace?.('_', ' ')}</p>
								<Link href={'/obrasci/' + form.id}>
									<h3 className='announcmentTitle'>{form.title}</h3>
								</Link>
								<Link className={styles.centerHorizontally} href={'/prijave/'+form.id+'?_page=1&_limit=24'}>Pregledaj prijave</Link>
							</article>
						)}
					)}
				</div>
			</>
		)
	}
}

export async function FormsList3({ limit, offset, desiredId, category, className }: newsProps) {
	const {count, forms} = await getFormsForEmployees({limit:limit, offset:offset, desiredId:desiredId, category:category})
	if (count === -1) return (<ActionResultInfo message='Dogodila se greška pri učitavanju obrazaca.' />)
	else if (count === 0) return (<h3 className={styles.centerHorizontally}>Nema obrazaca za prikazati</h3>)
	else {
		return (
			<>
				<div className='AnnouncmentsContainer'>
					{forms.map((form) => (
						<article className={`announcment ${className ? className : ''}`} key={form.id}>
							<p className='announcmentInfo'>{form.avalible_from.toLocaleDateString()} | {form.category.name.replace?.('_', ' ')}</p>
							<Link href={'/prijave/' + form.id + '?_page=1&_limit=25'}>
								<h3 className='announcmentTitle'>{form.title}</h3>
							</Link>
						</article>))}
				</div>
			</>
		)
	}
}