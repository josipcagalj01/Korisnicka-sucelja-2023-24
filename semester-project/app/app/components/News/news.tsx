import Link from 'next/link'
import * as React from 'react';
import ErrorInfo from '../errorinfo/errorinfo';
import Image from 'next/image';
import './newsStyle.css'
import { getNewsCardsData } from '../../../lib/contentfulClient';

interface newsProps {
  offset?: number,
  limit?: number
  desiredId?:number | undefined,
  category?:string | undefined,
  className?:string | undefined
}

export default async function News({limit=0,offset=0,desiredId=undefined, category=undefined, className}:newsProps) {
  const data = await getNewsCardsData({limit,offset,desiredId,category})
  if(data.count===-1) return (
    <>
      <ErrorInfo message='Dogodila se greška pri učitavanju obavijesti.'/>
    </>)
  else if (data.count===0) return (<p>Nema novih obavijesti</p>)
  else {
    return (
    <>
        <div className='AnnouncmentsContainer'>
          {data.news.map((announcment) => (
            <article className={`announcment ${className ? className :''}`} key={announcment.id}>
              <div className='announcmentImageContainer'>
                <Image src={announcment.image.url} alt={announcment.image.title} fill={true} sizes='220px' style={{objectFit:'cover'}}/>
              </div>
              <p className='announcmentInfo'>{announcment.date} | {announcment.category.replace('_',' ')}</p>
              <Link href={'/obavijesti/' + announcment.id}>
                <h3 className='announcmentTitle'>{announcment.title}</h3>
              </Link>
              <p className='announcmentText'> {announcment.summary}</p>
            </article>))}
        </div>
    </>
	)
  }
}