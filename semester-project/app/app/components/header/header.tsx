'use client'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { useState } from "react";
import Link from 'next/link'
import * as React from 'react';
import './headerStyle.css';
import logo from 'public/logo.png'
import Logout from '../Logout/logout'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react';
import spinner from 'public/spinner.gif'
import Image from 'next/image';

var pages = {
	Početna: "/",
	"O sustavu": "/o-sustavu",
	"Obavijesti": "/obavijesti?_page=1&_limit=10",
};

var loggedUserActions = {
	'Promjena lozinke' : '/promjena-lozinke'
}

const Header = () => {
	const [menuIconClicked, setMenuIconClickedState] = useState(false)
	const [userNameClicked, setUserNameClicked] = useState(false)

	const session = useSession({ required: false })

	const handleClickAway = () => {
		if (menuIconClicked) setMenuIconClickedState(false);
	}

	const handleClickAway2 = () => {
		if (userNameClicked) setUserNameClicked(false);
	}

	const currentPath = usePathname()
	return (
		<>
			<header>
				<ClickAwayListener onClickAway={handleClickAway}>
					<div className='menuIconContainer mobile'>
						<button onClick={() => setMenuIconClickedState(!menuIconClicked)} type='submit' className='MenuIcon mobile'>{!menuIconClicked ? '≡' : '×'}</button>
						{menuIconClicked &&
							<ul className="flex gap-8 DropdownMenu DropdownMenuLeft">
								{Object.entries(pages).map(([name, path]) => (
									<li key={name} className={`dropDownItem ${path.split('?')[0] === currentPath ? 'current' : ''}`}>
										<Link href={path}>{name}</Link>
									</li>))}
							</ul>
						}
					</div>
				</ClickAwayListener>
				<Link href='/'><Image src={logo.src} alt="Logo" className="mr-2" width={56} height={60} /></Link>
				<nav className="flex space-x-16 mx-2">
					<ul className="flex gap-8 menuItems">
						{Object.entries(pages).map(([name, path]) => (
							<li key={name} className={`desktop ${path.split('?')[0] === currentPath ? 'current' : ''}`}>
								<Link href={path}>{name}</Link>
							</li>))}
						{session?.status === 'loading' && <li><Image src={spinner.src} width={50} height={50} alt='ucitavanje' /> </li>}
						{session?.status === 'authenticated' &&
							<>
								<li>
									<ClickAwayListener onClickAway={handleClickAway2}>
										<div>
											<button type='submit' onClick={() => setUserNameClicked(!userNameClicked)} className='userNameButton'>
												<b className='desktop'>{session.data?.user.name} {session.data?.user.surname}</b>
												<b className='mobile'>{session.data?.user.name[0]} {session.data?.user.surname[0]}</b>
											</button>
											{userNameClicked &&
												<ul className='DropdownMenu DropdownMenuRight'>
													<li className='mobile dropDownItem'><b>{session.data?.user.name} {session.data?.user.surname}</b></li>
													{Object.entries(loggedUserActions).map(([name, path]) => (
														<li key={name} className={`dropDownItem ${path.split('?')[0] === currentPath ? 'current' : ''}`}>
															<Link href={path}>{name}</Link>
														</li>))}
													<li className='dropDownItem'><Logout /></li>
												</ul>}
										</div>
									</ClickAwayListener>
								</li>
							</>}
						{session?.status === 'unauthenticated' && <li className={`${'/prijava' === currentPath ? 'current' : ''}`} key='prijava'><Link href='/prijava' >Prijava</Link></li>
						}
					</ul>
				</nav>
			</header>
		</>
	);
}

export default Header;