'use client'
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import {Error401} from "./error/errorXYZ"
import Loading from "./Loading/loading"

export default function AccountSettingsWrapper({children}:{children:React.ReactNode}) {

    const session=useSession()
    const path = usePathname()
    if(session.status==='loading') return (<Loading message="Učitavanje"/>)
    return (
        <>
            {!session.data ?
            <Error401 callbackUrl={path}/>
            :
            <>{children}</>}
        </>
        
    )
}