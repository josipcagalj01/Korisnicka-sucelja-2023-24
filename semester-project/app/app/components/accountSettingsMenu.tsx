import Image from "next/image"
import React from 'react'
import BorderedLink from './BorderedLink/button'
import { actions } from "../moj-racun/[action]/page"

export default function AccountSettingsMenu() {
	return (
		<div className='accountPageContent'>
			<h2>Postavke korisničkog računa</h2>
			<ul className='accountSettingsMenu'>
				{actions.map((action => (
					<li key={action.formName}>
						<Image src={action.actionThumbnail} height={200} width={200} alt={action.text} />
						<BorderedLink href={'/moj-racun/' + action.text.toLowerCase().replaceAll(' ', '-').replaceAll('č', 'c').replaceAll('š', 's')}>{action.text}</BorderedLink>
					</li>
				)))}

			</ul>
		</div>
	)
}