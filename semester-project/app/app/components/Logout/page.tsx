'use client'
import {signOut} from 'next-auth/react'
import logouticon from 'public/logouticon.png'

interface logOutParams {
    icon?:boolean
}

export default function LogOut({icon=false}:logOutParams)
 {
    return(
        <>
             <button onClick={()=>signOut({callbackUrl:'/prijava'})} type='submit' style={{display:'flex', alignItems:'center', columnGap:'5px'}}>
                {icon && <img src={logouticon.src}/>} Odjava
             </button>
        </>
    )
}