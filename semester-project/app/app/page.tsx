import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import Header from './components/header/page'
import Footer from './components/footer/page'
import News from './components/News/page'
import './homepage.css'
import Link from 'next/link'
import { Suspense } from 'react';
import Loading from './components/Loading/page'
import {getSession} from '../lib/getSession'

export const metadata: Metadata = {
  title: 'Početna | eKaštela',
  description: 'Početna stranica platforme eKaštela',
}

export default async function Home() {
  const session = await getSession()
  return (
    <>
      <Header currentPage="Početna" session={session}/>
        <main>
          <div className="flex justify-center HomePageBanner">
            <img src="https://www.kastela-info.hr/media/image/103/fn1920x1920/001-1v2qzejb85206n.webp?ebYW" alt="Slika #1"/>
            <div className='HomePageBannerTextContainer'>
              <div className='textContainer'>
                <h1 className='HomePageLargeTitle'>e-Kaštela</h1>
                <p className='HomePageDescriptions'>Usluge lokalne samouprave za XXI. stoljeće</p>
              </div>
              <Link href='/prijava' className='borderedLink'><p className='linkText'>Započnite s korištenjem</p></Link>
            </div>
          </div>
          <div className="flex justify-center HomePageAnnouncmentsBanner">
            <h2>Nove obavijesti</h2>
            <div className='AnnouncmentsContainer'>
              <Suspense fallback={<Loading/>}>
                <News />
              </Suspense>
            </div>
            <Link href='/obavijesti?_page=1&_limit=10' className='marginLeftAuto displayBlock fitContent borderedLink'> <p className='linkText'>Starije obavijesti</p> </Link>
          </div>
            <div className="flex justify-center HomePageBanner Reverse">
              <div className='HomePageBannerTextContainer'>
                <div className='textContainer'>
                  <h1 className='HomePageLargeTitle'>Bilo kad. Bilo gdje. S bilo kojeg uređaja.</h1>
                  <p className='HomePageDescriptions'>Otkrijte novu dimenziju komunikacije s gradskom upravom, ustanovama i tvrtkama.</p>
                </div>
                <Link href='/o-sustavu' className='borderedLink'> <p className='linkText'>Pregled dostupnih usluga</p> </Link>
              </div>  
              <img src="https://cdn2.hubspot.net/hubfs/524149/Imported_Blog_Media/man-using-cc-on-his-phone-7.gif" alt="Slika #2"></img>
            </div>
        </main>
      <Footer isLoggedIn={session ? true : false}/>
    </>
  );
}

/*body className={inter.className}*/