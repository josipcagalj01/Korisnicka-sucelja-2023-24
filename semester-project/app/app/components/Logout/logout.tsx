'use client'
import * as React from 'react';
import {signOut} from 'next-auth/react'
import logouticon from 'public/logouticon.png'

interface logOutProps {
    icon?: boolean
}

function LogOut(props: logOutProps) {
    return(
        <>
             <button onClick={()=>signOut({callbackUrl:'/prijava'})} type='submit' style={{display:'flex', alignItems:'center', columnGap:'5px'}}>
                {props.icon && <img src={logouticon.src}/>} Odjava
             </button>
        </>
    )
}
export default LogOut