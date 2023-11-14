'use client'

import Link from 'next/link'
import * as React from 'react';
import './headerStyle.css';
import '../../globals.css'
import logo from 'public/logo.png'

var pages = {
    Početna: "/",
    "O nama": "/about",
    "Građanski forum": "/forum?_page=1&_limit=10",
    Prijava: "/prijava"
  };


export interface HeaderProps {
    currentPage: string;
}

export interface HeaderState {

}

class Header extends React.Component<HeaderProps, HeaderState> {
    /*constructor(props: HeaderProps) {
        super(props);
        this.state = {

        };
    }*/
    render() {
        return (
            <>
                <header>
                    <img src={logo.src} alt="Logo" className="mr-2" />
                    <nav className="flex space-x-16 mx-2">
                        <ul className="flex gap-8 menuItems">
                            {Object.entries(pages).map(([name, path]) => (
                            <li key={name} className = {this.props.currentPage===name ? 'current' : ''}>
                                <Link href={path}>{name}</Link>
                            </li>))}
                        </ul>
                    </nav>
                </header>
            </>
        );
    }
}

export default Header;