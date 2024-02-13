'use client'
import * as React from 'react';
import {signOut} from 'next-auth/react'
import logouticon from 'public/logouticon.png'

function LogOut() {
    return(
        <>
             <button onClick={()=>signOut({callbackUrl:'/prijava'})} type='submit'>
                Odjava
             </button>
        </>
    )
}
export default LogOut