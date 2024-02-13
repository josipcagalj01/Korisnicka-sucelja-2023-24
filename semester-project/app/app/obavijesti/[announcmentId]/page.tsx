//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import './newsPageStyle.css'
import { Metadata } from 'next'
import {getAnnouncment, getAnnouncmentTitle, fetchAnnouncmentTitlePackage} from '../../../lib/contentfulClient'
import ErrorInfo from '../../components/errorinfo/errorinfo'
import { Suspense } from 'react'
import Loading from '../../components/Loading/loading'
import Image from 'next/image'
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import {Error404} from '../../components/error/errorXYZ'

interface Params {
    announcmentId: string;
}

export const generateMetadata = async ({ params }: {params: Params}) : Promise<Metadata> => {
  const id = parseInt(params.announcmentId)
  if(Number.isNaN(id)) return {title:'Greška'}
  const announcment = await getAnnouncment({desiredId:id});
  if(announcment.count<=0) return {title:'Greška'}
  else return {title:announcment.announcment[0].title}
}

async function RenderAnnouncment(params:Params) {
  const id = parseInt(params.announcmentId)
  
  if(Number.isNaN(id)) return (<Error404/>)
  else {
    const response = await getAnnouncment({ offset: 0, limit: 0, desiredId: id })
	  if (response.count === 0) 
    return (<Error404/>)
	  else if(response.count===-1) return <ErrorInfo message='Došlo je do greške pri učitavanju obavijesti'/>
	  return (
		  <main>
      <article className='announcmentContainer'>
			  <h1>{response.announcment[0].title}</h1>
        <p>{response.announcment[0].date} | {response.announcment[0].category.replace('_',' ')}</p>
        {response.announcment[0].image && <Image src={response.announcment[0].image.url} alt={response.announcment[0].image.title} width={800} height={600}/>}
        {documentToReactComponents(response.announcment[0].body?.json, {preserveWhitespace: true, })}
      </article>
		  </main>)
  }
}

async function Announcment({ params }: {params: Params}) {
  return (
    <>
      <Suspense fallback={<Loading message='Obavijest se učitava ...'/>}>
				<RenderAnnouncment announcmentId={params.announcmentId}/>
			</Suspense>
    </>)
  }
export default Announcment