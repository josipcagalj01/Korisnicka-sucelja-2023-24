'use client'
import * as React from 'react';
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

function LogInOrOut({callbackUrl, className}:{callbackUrl?:string, className?:string}) {
	let url = '/prijava'
	if(callbackUrl) url = url + `?callbackUrl=${callbackUrl}`
	const session = useSession()
	switch(session.status) {
		case('loading') : return <Image className={className} src='/spinner.gif' height={15} width={15} alt='spinner' style={{margin:'auto'}}/>
		case('authenticated') : return <button className={className} onClick={() => signOut({callbackUrl:url})} type='submit'>Odjava</button>
		case('unauthenticated') : return <Link className={className} href='/prijava'>Prijava</Link>
	}
}
export default LogInOrOut