import Image from "next/image"
import password from 'public/password.png'
import mail from 'public/big_mail_image.png'
import user from 'public/pngwing.com.png'
import React from 'react'
import BorderedLink from './BorderedLink/button'


export default function AccountSettingsMenu() {
    return (
        <div className='accountPageContent'>
			<h1>Postavke korisničkog računa</h1>
     	<div className='accountSettingsMenu'>
				
        <div>
        	<Image src={user.src} height={200} width={200} alt='username'/>
        	<BorderedLink href='/moj-racun/promjena-korisnickog-imena'> Promjeni korisničko ime </BorderedLink>
        </div>
        <div>
			<Image src={mail.src} height={200} width={200} alt='username'/>
            <BorderedLink href='/moj-racun/promjena-e-poste'>Promjeni adresu e-pošte</BorderedLink>
        </div>
        <div>
            <Image src={password.src} height={200} width={200} alt='username'/>
            <BorderedLink href='/moj-racun/promjena-lozinke'>Promjeni lozinku</BorderedLink>
        </div>        
      </div>
    </div>
    )
}