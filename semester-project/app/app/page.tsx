import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import Header from './components/header/page'
import Footer from './components/footer/page'
import './globals.css'
import'./homepage.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Početna | eKaštela',
  description: 'Početna stranica platforme eKaštela',
}

export default function Home() {
  return (
    <body >
      <Header currentPage="Početna" />
        <main>
          <div className="flex justify-center HomePageBanner">
            <img src="https://www.kastela-info.hr/media/image/103/fn1920x1920/001-1v2qzejb85206n.webp?ebYW" alt="Slika #1"/>
            <div className='HomePageBannerTextContainer'>
              <div className='textContainer'>
                <h1 className='HomePageLargeTitle'>e-Kaštela</h1>
                <p className='HomePageDescriptions'>Usluge lokalne samouprave za XXI. stoljeće</p>
              </div>
              <Link href='/prijava'>Započnite s korištenjem</Link>
            </div>
          </div>
          <div className="flex justify-center HomePageAnnouncmentsBanner">
            <h2>Nove obavijesti</h2>
            <div className='AnnouncmentsContainer'>
              <article className='announcment'>
                <img className='announcmentImage' src='https://nextbridge.com/wp-content/uploads/2022/02/Application-Maintenance-Support-Services.png' alt='slika'/>
                <h3 className='announcmentTitle'>Održavanje 1</h3>
                <p className='announcmentText'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <Link href='/#'> Opširnije</Link>
              </article>
              <article className='announcment'>
                <img className='announcmentImage' src='https://nextbridge.com/wp-content/uploads/2022/02/Application-Maintenance-Support-Services.png' alt='slika'/>
                <h3 className='announcmentTitle'>Održavanje 2</h3>
                <p className='announcmentText'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <Link href='/#'> Opširnije</Link>
              </article>
              <article className='announcment'>
                <img className='announcmentImage' src='https://nextbridge.com/wp-content/uploads/2022/02/Application-Maintenance-Support-Services.png' alt='slika'/>
                <h3 className='announcmentTitle'>Održavanje 3</h3>
                <p className='announcmentText'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <Link href='/#'> Opširnije</Link>
              </article>
              <article className='announcment'>
                <img className='announcmentImage' src='https://nextbridge.com/wp-content/uploads/2022/02/Application-Maintenance-Support-Services.png' alt='slika'/>
                <h3 className='announcmentTitle'>Održavanje 4</h3>
                <p className='announcmentText'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <Link href='/#'> Opširnije</Link>
              </article>
            </div>
            <div className='allignSelfRight'><Link href='/#' >Starije obavijesti</Link></div>
          </div>
            <div className="flex justify-center HomePageBanner Reverse">
              <div className='HomePageBannerTextContainer'>
                <div className='textContainer'>
                  <h1 className='HomePageLargeTitle'>Bilo kad. Bilo gdje. S bilo kojeg uređaja.</h1>
                  <p className='HomePageDescriptions'>Otkrijte novu dimenziju komunikacije s gradskom upravom, ustanovama i tvrtkama.</p>
                </div>
                <Link href='/about'>Pregled dostupnih usluga</Link>
              </div>  
              <img src="https://cdn2.hubspot.net/hubfs/524149/Imported_Blog_Media/man-using-cc-on-his-phone-7.gif" alt="Slika #2"></img>
            </div>
            <div className="flex justify-center HomePageBanner">
            <img src="https://www.kastela.org/images/stories//novosti/2022/08/dan-pobjede1/galerija/dan_pobjede_kastel_stari-32.jpg" alt="Slika #3"/>
            <div className='HomePageBannerTextContainer'>
              <div className='textContainer'>
                <h1 className='HomePageLargeTitle'>Cijenimo vaše mišljenje.</h1>
                <p className='HomePageDescriptions'>Pitajte i informirajte se o gradskim temama koje Vas zanimaju.</p>
              </div>
              <Link href='/forum'>Posjetite građanski forum</Link>
            </div>
          </div>
        </main>
        <Footer />
      
    </body>
  );
}

/*body className={inter.className}*/