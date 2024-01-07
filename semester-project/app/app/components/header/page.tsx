'use client'
import { useState } from "react";
import Link from 'next/link'
import * as React from 'react';
import './headerStyle.css';
import logo from 'public/logo.png'
import Logout from '../Logout/page'
import {Session} from '../../lib/getSession'
var pages = {
	Početna: "/",
	"O sustavu": "/o-sustavu",
	"Obavijesti": "/obavijesti?_page=1&_limit=10",
	
  };
/*Prijava: "/prijava"*/


export interface HeaderProps {
	currentPage: string
	session: Session | null
}

const Header = (props:HeaderProps) => {
	const[menuIconClicked, setMenuIconClickedState] = useState(false)

		return (
			<>
				<header>
					<Link href='/'><img src={logo.src} alt="Logo" className="mr-2" /></Link>
					<nav className="flex space-x-16 mx-2">
						<ul className="flex gap-8 menuItems">
							
							{Object.entries(pages).map(([name, path]) => (
							<li key={name} className = {props.currentPage===name ? 'current' : ''}>
								<Link href={path}>{name}</Link>
							</li>))}
							
						</ul>
					</nav>
					<ul className='loginSection'>
						{props.session && <li><b>{props.session.user.name} {props.session.user.surname}</b></li>}
						{!props.session ? <li className={props.currentPage==='Prijava' ? 'current' : ''}><Link href='/prijava' >Prijava</Link></li> : <li><Logout /></li>}
					</ul>
					<button onClick={() => {setMenuIconClickedState(!menuIconClicked)}} type='submit' className='MenuIcon'>{!menuIconClicked ? '≡' : '×'}</button>
				</header>
				<div className={!menuIconClicked ? 'dropDownContainer displaynone' : 'dropDownContainer'}>
					<ul className="flex gap-8 dropdown ">
					{props.session && <li><b>{props.session.user.name} {props.session.user.surname}</b></li>}
					{Object.entries(pages).map(([name, path]) => (
						<li key={name} className = {props.currentPage===name ? 'current' : ''}>
							<Link href={path}>{name}</Link>
						</li>))}
						{!props.session ? <li className={props.currentPage==='Prijava' ? 'current' : ''}><Link href='/prijava' >Prijava</Link></li> : <li><Logout /></li>}
					</ul>
				</div>
			</>
		);
	
}

export default Header;