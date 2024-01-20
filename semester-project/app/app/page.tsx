import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import News from './components/News/news'
import './homepage.css'
import Link from 'next/link'
import { Suspense } from 'react';
import Loading from './components/Loading/loading'
import Image from 'next/image'
import digitalsociety from 'public/digitalsociety.jpg'

export const metadata: Metadata = {
  title: 'Početna | eKaštela',
  description: 'Početna stranica informacijskog sustava eKaštela',
}

export default function Home() {
  return (
    <>
      
      <div className="flex justify-center landingBanner">
        <div className='textContainerContainer'>
            <div className='textContainer'>
              <h1 className='HomePageLargeTitle'>e-Kaštela</h1>
              <p className='HomePageDescriptions'>Usluge lokalne samouprave za XXI. stoljeće</p>
              <Link href='/prijava' className='borderedLink'><p className='linkText'>Započnite s korištenjem</p></Link>
          </div>
        </div>
      </div>
      <main className='homePageMain'>
        
        <div className="HomePageAnnouncmentsBanner">
          <h2>Najnovije obavijesti</h2>
          <Suspense fallback={<Loading message='Učitavanje obavijesti'/>}>
            <News limit={4} offset={0} desiredId={undefined}/>
          </Suspense>
          <Link href='/obavijesti?_page=1&_limit=10' className='marginLeftAuto displayBlock fitContent borderedLink'> <p className='linkText'>Sve obavijesti</p> </Link>
        </div>
        <div className="flex justify-center HomePageBanner Reverse">
          <div className='HomePageBannerTextContainer'>
            <div className='textContainer'>
              <h1 className='HomePageLargeTitle'>Bilo kad. Bilo gdje. S bilo kojeg uređaja.</h1>
              <p className='HomePageDescriptions'>Otkrijte novu dimenziju komunikacije s gradskom upravom, ustanovama i tvrtkama.</p>
              <Link href='/o-sustavu' className='borderedLink'> <p className='linkText'>Pregled dostupnih usluga</p> </Link>
            </div>
          </div><Image src={digitalsociety.src} height={500} width={500} alt='slika3'/>
          
        </div>
      </main>
      
    </>
  );
}

/*body className={inter.className}*/