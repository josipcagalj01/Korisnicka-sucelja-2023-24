'use client'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { useState } from "react";
import Link from 'next/link'
import * as React from 'react';
import './headerStyle.css';
import Logout from '../log-in-or-out/logout'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react';
import spinner from 'public/spinner.gif'
import Image from 'next/image';

interface pages {
	name: string,
	path:string,
	loginRequired:boolean
}

var pages:pages[]= [
	{
		name:'Početna',
		path: '/',
		loginRequired: false
	},
	{
		name: 'O sustavu',
		path:'/o-sustavu',
		loginRequired: false
	},
	{
		name:'Obavijesti',
		path: '/obavijesti?_page=1&_limit=10',
		loginRequired: false
	},
	{
		name:'Usluge',
		path:'/usluge?_page=1&_limit=10',
		loginRequired: true
	}
]

var loggedUserActions = {
	'Moja stranica': '/moj-racun'
}

export function CreateListOfLinks({className, markCurrent=false}:{className?:string, markCurrent?:boolean}) {
	const session = useSession()
	const currentPath = usePathname()
	return(
		<>
			{pages.map((page) => (
				((page.loginRequired && session.data) || !page.loginRequired) &&
					<li key={page.name} className={`${className || ''} ${markCurrent && (page.path===currentPath || currentPath.split('/')[1]!='' && page.path.includes(currentPath.split('/')[1])) ? 'current' : ''}`}>
						<Link href={page.path}>{page.name}</Link>
					</li>
			))}
		</>
	)
}

const Header = () => {
	const [menuIconClicked, setMenuIconClickedState] = useState(false)
	const [userNameClicked, setUserNameClicked] = useState(false)

	const session = useSession()
	const currentPath = usePathname()
	
	const handleClickAway = () => {
		if (menuIconClicked) setMenuIconClickedState(false);
	}

	const handleClickAway2 = () => {
		if (userNameClicked) setUserNameClicked(false);
	}

	return (
		<header>
			<div className='headerMain'>
				<ClickAwayListener onClickAway={handleClickAway}>
					<div className='menuIconContainer mobile'>
						<button onClick={() => setMenuIconClickedState(!menuIconClicked)} type='submit' className='MenuIcon mobile'>
							<Image src={!menuIconClicked ? '/menuicon.png' : '/x-icon.png'} width={60} height={60} alt='icon' className='menuIcon' />
						</button>
						{menuIconClicked &&
							<ul className="flex gap-8 DropdownMenu DropdownMenuLeft" onClick={() => handleClickAway()}>
								<CreateListOfLinks className='dropDownItem' markCurrent={true} />
							</ul>
						}
					</div>
				</ClickAwayListener>
				<Link href='/'><Image src='/logo.png' alt="Logo" className="mr-2 headerLogo" width={56} height={60} /></Link>
				<nav className="flex space-x-16 mx-2">
					<ul className="flex gap-8 menuItems">
						<CreateListOfLinks className='desktop' markCurrent={true} />
						{session?.status === 'loading' && <li><Image src={spinner.src} width={50} height={50} alt='ucitavanje' /> </li>}
						{session?.status === 'authenticated' &&
							<li>
								<ClickAwayListener onClickAway={handleClickAway2}>
									<div>
										<button type='submit' onClick={() => setUserNameClicked(!userNameClicked)} className='userNameButton'>
											<b className='desktop'>{session.data?.user.name} {session.data?.user.surname}</b>
											<p className='mobile'>{session.data?.user.name[0]} {session.data?.user.surname[0]}</p>
										</button>
										{userNameClicked &&
											<ul className='DropdownMenu DropdownMenuRight' onClick={() => handleClickAway2()}>
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
						}
						{session?.status === 'unauthenticated' && <li className={`${'/prijava' === currentPath ? 'current' : ''}`} key='prijava'><Link href='/prijava' >Prijava</Link></li>}
					</ul>
				</nav>
			</div>
		</header>
	);
}
export default Header;