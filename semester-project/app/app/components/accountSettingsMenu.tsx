import Image from "next/image"
import React from 'react'
import BorderedLink from './BorderedLink/button'
import { actions } from "../moj-racun/[action]/page"

export default function AccountSettingsMenu() {
    return (
        <div className='accountPageContent'>
			<h1>Postavke korisničkog računa</h1>
            <ul className='accountSettingsMenu'>
                {actions.map((action=>(
                    <li key={action.parameter}>
                        <Image src={action.actionThumbnail} height={200} width={200} alt={action.text}/>
                        <BorderedLink href={'/moj-racun/'+action.parameter}>{action.text}</BorderedLink>
                    </li>
                )))}
                        
            </ul>
        </div>
    )
}