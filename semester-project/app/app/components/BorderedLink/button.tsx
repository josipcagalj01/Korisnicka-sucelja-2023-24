import { Url } from "next/dist/shared/lib/router/router"
import * as React from 'react';
import Link from "next/link"
import './borderedLinkStyle.css'

interface linkProps {
	href: Url,
	children: React.ReactNode,
	className?: string,
	target?: string
}

export default function BorderedLink({ href, children, className = '', target='' }: linkProps) {
	return (
		<Link href={href ?? ''} className={`borderedLink ${className}`} target={target}><p className='linkText'>{children}</p></Link>
	)
}

export function BorderedButton({type='button', className='', disabled=false, onClick, children }: {type?: 'button' | 'submit' | 'reset', className?:string, disabled?:boolean, onClick?: any, children: React.ReactNode }) {
	return (<button type={type} className={'borderedLink ' + className} disabled={disabled} onClick={onClick}><p className='linkText'>{children}</p></button>)
}