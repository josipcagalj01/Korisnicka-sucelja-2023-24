'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link';
import Image from 'next/image';

function LogInOrOut({callbackUrl, className, spinnerSize=15}:{callbackUrl?:string, className?:string, spinnerSize?:number}) {
	let url = '/prijava'
	if(callbackUrl) url = url + `?callbackUrl=${callbackUrl}`
	const session = useSession()
	switch(session.status) {
		case('loading') : return <figure style={{margin:'auto', position:'relative', width: `${spinnerSize}px`, aspectRatio: 1}}><Image src='/spinner.gif' fill={true} alt='spinner' style={{objectFit: 'contain'}}/></figure>
		case('authenticated') : return <button className={className} onClick={() => signOut({callbackUrl:url})} type='button'>Odjava</button>
		case('unauthenticated') : return <Link className={className} href='/prijava'>Prijava</Link>
	}
}
export default LogInOrOut