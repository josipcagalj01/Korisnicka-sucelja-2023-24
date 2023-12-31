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
  //if(!session) redirect('../prijava')
  return (
    <>
      <Header currentPage='O sustavu' session={session}/>
      <main className='prose lg:prose-xl'>
        <Suspense fallback={<Loading />}>
          <RenderAboutPageContent/>
        </Suspense>  
      </main>
      <Footer isLoggedIn={session ? true : false}/>
    </>
  )
}

  export default AboutPage;
  /*return (
      <>
        
        <div className="flex justify-center">
          <h2>Dobar dan, {session?.user.name} {session?.user.surname}</h2>
          <h1>Ovo je stranica s informacijama o sustavu, uslugama koje se nude i kako postati korisnik</h1>
          <Logout />
        </div>
      </>
    );*/