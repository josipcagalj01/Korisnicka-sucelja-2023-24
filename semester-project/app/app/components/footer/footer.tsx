'use client'
import Link from 'next/link'
import * as React from 'react';
import Image from 'next/image';
import logo from 'public/logo.png'
import websiteicon from 'public/websiteicon.png'
import locationicon from 'public/locationicon.png'
import phoneicon from 'public/phoneicon.png'
import faxicon from 'public/faxicon.png'
import mailicon from 'public/mailicon.png'
import './footerStyle.css'
import Logout from '../Logout/logout'
import { useSession } from 'next-auth/react';

var pages = {
    Početna: "/",
    "O sustavu": "/o-sustavu",
    "Obavijesti": "/obavijesti?_page=1&_limit=10",
};

const Footer = ()=> {

	const session=useSession({required:false})
	return (
		<>
			<footer>
				<div className="briefInfo">
					<Image src={logo.src} alt="Logo" width={100} height={100}  className="mr-2 logo"/>
					<div>
						<h2>Grad Kaštela</h2>
						<div className='IconAndTextContainer'>
							<Image src={locationicon.src} width={15} height={15} alt='lokacija' />
							<Link href='https://maps.app.goo.gl/CAwVywo7iLdihMtRA'><p>Ulica braće Radić 1<br />21212 Kaštel Sućurac</p></Link>
						</div>
						<div className='IconAndTextContainer'>
							<Image src={websiteicon.src} width={15} height={15} alt="webstranica" />
							<Link href="https://www.kastela.hr">kastela.hr</Link>
						</div>
					</div>
					<div>
						<h2>Poveznice</h2>
						<ul>
							{Object.entries(pages).map(([name, path]) => (
								<li key={name}>
									<Link href={path}>{name}</Link>
								</li>))}
								{session?.data ? <li key='logout'><Logout/></li> : <li key='prijava'><Link href='/prijava'>Prijava</Link></li>}
						</ul>
					</div>
					<div>
						<h2>Kontakt</h2>
						<div className='IconAndTextContainer'>
							<Image src={phoneicon.src} width={15} height={15} alt='telefon' />
							<Link href='tel:+38512345678'>+385 12 345 678</Link>
						</div>
						<div className='IconAndTextContainer'>
							<Image src={faxicon.src} width={15} height={15} alt='telefon' />
							<Link href='tel:+38512345679'>+385 12 345 679</Link>
						</div>
						<div className='IconAndTextContainer'>
							<Image src={mailicon.src} width={15} height={15} alt='e-pošta' />
							<Link href='mailto: ured@kastela.hr'>ured@kastela.hr</Link>
						</div>
					</div>
				</div>
				<div className="CopyrightAndManofacturerInfo">
					<p>Sva prava pridržana 2023 Grad Kaštela</p>
				</div>
			</footer>
		</>
	);
}
export default Footer;