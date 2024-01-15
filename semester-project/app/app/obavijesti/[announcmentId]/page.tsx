//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import Header from '../../components/header/page'
import './newsPageStyle.css'
import { Metadata } from 'next'
import Footer from '../../components/footer/page'
import { getSession } from '../../../lib/getSession'
import {getNews} from '../../../lib/contentfulClient'
import { newsPackage } from '../../../lib/contentfulClient'
import ErrorInfo from '../../components/errorinfo/page'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Loading from '../../components/Loading/page'

interface Params {
    announcmentId: number;
}

const BASE_API_URL = "https://jsonplaceholder.typicode.com";

export const generateMetadata = async ({ params }: {params: Params}) : Promise<Metadata> => {
  let announcment:newsPackage={count:0, news:[]}
  announcment = await getNews({offset:0, limit:0, desiredId:params.announcmentId});
  if(announcment.count<=0)
    return {
      title:'Greška'
    }
  else return {
    title:announcment.news[0].title
  }
}

async function RenderAnnouncment(params:Params) {
	const response = await getNews({ offset: 0, limit: 0, desiredId: params.announcmentId })
	if (response.count === 0) redirect('/not-found')
	else if(response.count===-1) return <ErrorInfo message='Došlo je do greške pri učitavanju obavijesti'/>
	return (
		<>
			<h1>{response.news[0].title}</h1>
			<br />
			<p className="text-xl p-10">{response.news[0].body}</p>
		</>
	)
}

async function Announcment({ params }: {params: Params}) {
  const session = await getSession()
  return (
    <>
      <main>
				<Suspense fallback={<Loading message='Obavijest se učitava ...'/>}>
					<RenderAnnouncment announcmentId={params.announcmentId}/>
				</Suspense>
      </main>
    </>)
  }
export default Announcment