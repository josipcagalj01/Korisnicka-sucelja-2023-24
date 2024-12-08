import Link from 'next/link'
import * as React from 'react';
import ErrorInfo from '../actionResultInfo/actionResultInfo';
import Image from 'next/image';
import './newsStyle.css'
import { getNewsCardsData } from '../../../lib/manage-announcments/db_queries';

export interface newsProps {
	forEmployees?:boolean,
	offset?: number,
	limit?: number
	category?: number,
	className?: string
}

export default async function News({forEmployees=false, limit, offset, category, className }: newsProps) {
	const data = await getNewsCardsData({forEmployees, limit, offset, category })
	if (!data) return (<ErrorInfo message='Dogodila se greška pri učitavanju obavijesti.' />)
	else if (data.length === 0) return (<p>Nema objava za prikazati</p>)
	else {
		return (
			<>
				<div className='AnnouncmentsContainer'>
					{data.map((announcment) => (
						<article className={`announcment ${className ? className : ''}`} key={announcment.id}>
							<figure className='announcmentImageContainer'>
								<Image src={announcment.thumbnail_id ? '/api/datoteka/obavijesti/' + announcment.id + '/minijatura' : '/bilazgrada.jpg'} alt={announcment.title} fill={true} sizes='220px' style={{ objectFit: 'cover' }} />
							</figure>
							<p className='announcmentInfo'>{announcment.date.toLocaleDateString('hr-hr', {timeZone: 'Europe/Zagreb'})} | {announcment.category.name}</p>
							<Link href={`/${forEmployees ? 'objave' : 'obavijesti'}/` + announcment.id}>
								<h3 className='announcmentTitle'>{announcment.title}</h3>
							</Link>
							<p className='announcmentText'> {announcment.summary}...</p>
						</article>))}
				</div>
			</>
		)
	}
}