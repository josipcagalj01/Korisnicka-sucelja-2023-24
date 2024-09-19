'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link';
import Loader from '../loader/loader';

function LogInOrOut({callbackUrl, className, spinnerSize=15}:{callbackUrl?:string, className?:string, spinnerSize?:number}) {
	let url = '/prijava'
	if(callbackUrl) url = url + `?callbackUrl=${callbackUrl}`
	const session = useSession()
	switch(session.status) {
		case('loading') : return <Loader size={spinnerSize}/>
		case('authenticated') : return <button className={className} onClick={() => signOut({callbackUrl:url})} type='button'>Odjava</button>
		case('unauthenticated') : return <Link className={className} href='/prijava'>Prijava</Link>
	}
}
export default LogInOrOut