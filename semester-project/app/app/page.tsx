import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import News from './components/News/news'
import './homepage.css'
import Link from 'next/link'
import { Suspense } from 'react';
import Loading from './components/Loading/loading'
import Image from 'next/image'
import bilazgrada from 'public/bilazgrada.jpg'
import cloudservices from 'public/cloudservices.png'
import BorderedLink from './components/BorderedLink/button'

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
						<BorderedLink href='/prijava'>Započnite s korištenjem</BorderedLink>
					</div>
				</div>
			</div>
			<main className='homePageMain'>
				<div className="HomePageAnnouncmentsBanner">
					<h2>Najnovije obavijesti</h2>
					<Suspense fallback={<Loading message='Učitavanje obavijesti' />}>
						<News limit={6} offset={0} className='mobile-no-summary'/>
					</Suspense>
					<BorderedLink href='/obavijesti?_page=1&_limit=10' className='marginLeftAuto displayBlock'>Sve obavijesti</BorderedLink>
				</div>
				<div className='HomePageBanner'>
					<h2>Opće informacije</h2>
					<div className='generalInfoContainer'>
						<div className='imageAndLinkContainer'>
							<div className='imageContainer'>
							<Image src={bilazgrada.src} fill={true} sizes='300px' quality={100}  style={{ objectFit: 'cover' }} alt='uvjetikoristenja' />
							</div>
							<BorderedLink href='/o-sustavu'>Uvjeti korištenja</BorderedLink>
						</div>
						<div className='imageAndLinkContainer'>
							<div className='imageContainer'>
								<Image src={cloudservices.src} fill={true} sizes='300px' style={{ objectFit: 'cover' }} alt='uvjetikoristenja' />
							</div>
							<BorderedLink href='/katalog-usluga'>Katalog usluga</BorderedLink>
						</div>
					</div>
				</div>

			</main>
		</>
	);
}