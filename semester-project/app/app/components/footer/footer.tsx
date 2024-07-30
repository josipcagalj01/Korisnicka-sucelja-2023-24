import Link from 'next/link'
import * as React from 'react';
import Image from 'next/image';
import './footerStyle.css'
import LogInOrOut from '../log-in-or-out/logout'
import { CreateListOfLinks } from '../header/header';

const Footer = () => {
	return (
		<footer>
			<div className='footerMain'>
				<div className="briefInfo">
					<Image src='/logo.png' alt="Logo" width={110} height={110} className='logo' />
					<div>
						<h2>Grad Kaštela</h2>
						<div className='IconAndTextContainer'>
							<Image src='/footer-icons/locationicon.png' width={15} height={15} alt='lokacija' className='footerIcon' />
							<Link href='https://maps.app.goo.gl/CAwVywo7iLdihMtRA'><p>Ulica braće Radić 1<br />21212 Kaštel Sućurac</p></Link>
						</div>
						<div className='IconAndTextContainer'>
							<Image src='/footer-icons/websiteicon.png' width={15} height={15} alt="webstranica" className='footerIcon' />
							<Link href="https://www.kastela.hr">kastela.hr</Link>
						</div>
					</div>
					<div>
						<h2>Poveznice</h2>
						<ul className='footer-ul'>
							<CreateListOfLinks />
							<li key='log-in-or-out'><LogInOrOut /></li>
						</ul>
					</div>
					<div>
						<h2>Kontakt</h2>
						<div className='IconAndTextContainer'>
							<Image src='/footer-icons/phoneicon.png' width={15} height={15} alt='telefon' className='footerIcon' />
							<Link href='tel:+38512345678'>+385 12 345 678</Link>
						</div>
						<div className='IconAndTextContainer'>
							<Image src='/footer-icons/faxicon.png' width={15} height={15} alt='telefon' className='footerIcon' />
							<Link href='tel:+38512345679'>+385 12 345 679</Link>
						</div>
						<div className='IconAndTextContainer'>
							<Image src='/footer-icons/mailicon.png' width={15} height={15} alt='e-pošta' className='footerIcon' />
							<Link href='mailto: ured@kastela.hr'>ured@kastela.hr</Link>
						</div>
					</div>
				</div>
			</div>
			<div className='CopyrightAndManofacturerInfoContainer'>
				<div className="CopyrightAndManofacturerInfo">
					<p>Sva prava pridržana 2023 Grad Kaštela</p>
				</div>
			</div>
		</footer>
	);
}
export default Footer;