'use client'
import { useState } from "react";
import Link from 'next/link'
import * as React from 'react';
import './headerStyle.css';
import '../../globals.css'
import logo from 'public/logo.png'

var pages = {
    Početna: "/",
    "O sustavu": "/o_sustavu",
    "Građanski forum": "/forum?_page=1&_limit=10",
    Prijava: "/prijava"
  };


export interface HeaderProps {
    currentPage: string;
}

const Header = (props:HeaderProps) => {
    const[menuIconClicked, setMenuIconClickedState] = useState(false)

        return (
            <>
                <header>
                    <img src={logo.src} alt="Logo" className="mr-2" />
                    <nav className="flex space-x-16 mx-2">
                        <ul className="flex gap-8 menuItems">
                            {Object.entries(pages).map(([name, path]) => (
                            <li key={name} className = {props.currentPage===name ? 'current' : ''}>
                                <Link href={path}>{name}</Link>
                            </li>))}
                        </ul>
                        <button onClick={() => {setMenuIconClickedState(!menuIconClicked)}} type='submit' className='MenuIcon'>≡</button>
                    </nav>
                </header>
                <div className={!menuIconClicked ? 'dropDownContainer displaynone' : 'dropDownContainer'}>
                    <ul className="flex gap-8 dropdown ">
                    {Object.entries(pages).map(([name, path]) => (
                        <li key={name} className = {props.currentPage===name ? 'current' : ''}>
                            <Link href={path}>{name}</Link>
                        </li>))}
                    </ul>
                </div>
            </>
        );
    
}

export default Header;