import type { Metadata } from 'next'
import Header from '../components/header/page'
import Footer from '../components/footer/page'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import { Suspense } from 'react';
import Loading from '../components/Loading/page'
import ErrorInfo from '../components/errorinfo/page'
import {getSession} from '../../lib/getSession'
import {getAboutPageContent} from '../../lib/contentfulClient'

export const metadata: Metadata = {
  title: 'O sustavu',
  description: 'Opće informacije o sustavu eKaštela',
}

async function RenderAboutPageContent() {
  const response = await getAboutPageContent()
  return (
    <>
    {response.length ? 
      <>
        <img src={response[0].imageurl} alt='slika'/>
        <br/>
        <p>{response[0].abouttext}</p>
      </> :
      <ErrorInfo message='Dogodila se greška pri učitavanju stranice.'/>}
    </>
  )
}

async function AboutPage() {
  const session = await getSession()
  return (
    <>
      <main className='prose lg:prose-xl'>
        <Suspense fallback={<Loading  message='Učitavanje stranice ...'/>}>
          <RenderAboutPageContent/>
        </Suspense>  
      </main>
    </>
  )
}
export default AboutPage;