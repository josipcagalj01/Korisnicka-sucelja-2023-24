'use client'

import Link from 'next/link'
import * as React from 'react';

import logo from 'public/logo.png'
import websiteicon from 'public/websiteicon.png'
import locationicon from 'public/locationicon.png'
import phoneicon from 'public/phoneicon.png'
import faxicon from 'public/faxicon.png'
import mailicon from 'public/mailicon.png'
import './footerStyle.css'

var pages = {
    Početna: "/",
    "O nama": "/about",
    "Građanski forum": "/forum?_page=1&_limit=10",
    Prijava: "/login"
};

export interface FooterProps {
    currentPage: string;
}

export interface FooterState {

}

class Footer extends React.Component{
    render() {
        return (
            <>
                <footer>
                    <div className="briefInfo">
                        <img src={logo.src} alt="Logo" className="mr-2 logo" />
                        <div>
                            <h2>Grad Kaštela</h2>
                            <div className='IconAndTextContainer'>
                                <img src={locationicon.src} alt='lokacija'/>
                                <p>Ulica braće Radić 2 <br/>21212 Kaštel Sućurac</p>
                            </div>
                            <div className='IconAndTextContainer'>
                                <img src={websiteicon.src} alt="webstranica"/>
                                <Link href="www.kastela.hr">kastela.hr</Link>
                            </div>
                        </div>
                        <div>
                            <h2>Izbornik</h2>
                            <ul className="flex gap-8 ">
                                {Object.entries(pages).map(([name, path]) => (
                                <li key={name}>
                                    <Link href={path}>{name}</Link>
                                </li>))}
                            </ul>
                        </div>
                        <div>
                            <h2>Kontakt:</h2>
                            
                            <div className='IconAndTextContainer'>  
                                <img src={phoneicon.src} alt='telefon'/>
                                <p>+385 12 345 678</p>
                            </div>
                            <div className='IconAndTextContainer'>
                                <img src={faxicon.src} alt='telefon'/>
                                <p>+385 12 345 679</p>
                            </div>
                            <div className='IconAndTextContainer'>
                                <img src={mailicon.src} alt='e-pošta'/>
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
}

export default Footer;