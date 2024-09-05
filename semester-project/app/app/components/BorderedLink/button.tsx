import { Url } from "next/dist/shared/lib/router/router"
import * as React from 'react';
import Link from "next/link"
import './borderedLinkStyle.css'

interface linkProps {
	href: Url,
	children: React.ReactNode,
	className?: string
}

export default function BorderedLink({ href, children, className = '' }: linkProps) {
	return (
		<Link href={href ?? ''} className={`borderedLink ${className}`}><p className='linkText'>{children}</p></Link>
	)
}

export function BorderedButton({ onClick, children }: { onClick?: any, children: React.ReactNode }) {
	return (<button className='borderedLink' onClick={onClick}><p className='linkText'>{children}</p></button>)
}