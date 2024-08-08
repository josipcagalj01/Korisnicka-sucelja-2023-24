import Image from "next/image"
import React from 'react'
import BorderedLink from './BorderedLink/button'
import { Settings } from "./employeeActions"

export default function SettingsMenu({menu}:{menu:Settings}) {
	return (
		<div className='accountPageContent'>
			<h2>{menu.description}</h2>
			
			<ul className='accountSettingsMenu'>
				{menu.actions.map((action => (
					<li key={action.text}>
						<figure>
							<Image src={action.thumbnail} fill={true} sizes="100px" style={{ objectFit: 'contain' }} alt={action.text} />
						</figure>
						<BorderedLink href={action.basePath + '/' + action.text.toLowerCase().replaceAll(' ', '-').replaceAll('č', 'c').replaceAll('š', 's')}>{action.text}</BorderedLink>
					</li>
				)))}
			</ul>
		</div>
	)
}