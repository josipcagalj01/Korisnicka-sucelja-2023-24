import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import { Suspense } from 'react';
import Loading from '../components/Loading/loading'
import ErrorInfo from '../components/actionResultInfo/actionResultInfo'
import {getAboutPageContent} from '../../lib/contentfulClient'
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import './aboutPageStyle.css'

export const metadata: Metadata = {
  title: 'O sustavu',
  description: 'Opće informacije o sustavu eKaštela',
}

async function RenderAboutPageContent() {
  const response = await getAboutPageContent()
  return (
    <>
    {response.length ? 
      <article className='text'>
        {documentToReactComponents(response[0].abouttext2.json)}
      </article> :
      <ErrorInfo message='Dogodila se greška pri učitavanju stranice.'/>}
    </>
  )
}

async function AboutPage() {
  return (
    <>
    <div className="flex justify-center aboutPageLandingBanner"/>
      <main className='prose lg:prose-xl aboutPageMain'>
        <Suspense fallback={<Loading message='Učitavanje stranice ...'/>}>
          <RenderAboutPageContent/>
        </Suspense>  
      </main>
    </>
  )
}
export default AboutPage;