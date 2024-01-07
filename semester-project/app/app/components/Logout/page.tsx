'use client'
import {signOut} from 'next-auth/react'
export default function Odjava() {
    return(
        <>
             <button onClick={()=>signOut({callbackUrl:'/prijava'})} type='submit'>Odjava</button>
        </>
    )
}