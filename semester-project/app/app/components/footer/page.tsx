'use client'

import Link from 'next/link'
import * as React from 'react';
//import './headerStyle.css';

import logo from 'public/logo.png'
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
                        <div>
                        <img src={logo.src} alt="Logo" className="mr-2 logo" />
                        <p>Grad Kaštela</p>
                        <p>Ulica braće Radić 2</p>
                        <p>21212 Kaštel Sućurac</p>
                        <Link href="www.kastela.hr">kastela.hr</Link>
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
                            <p>Telefon: +385 12 345 678</p>
                            <p>Fax: +385 12 345 679</p>
                            <p>e-Pošta: ured@kastela.hr</p>
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