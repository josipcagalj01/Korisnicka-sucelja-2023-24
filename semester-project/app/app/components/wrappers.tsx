'use client'
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Error403, Error401 } from "./error/errorXYZ"
import Loading from "./Loading/loading"

export default function AccountSettingsWrapper({children}: {children: React.ReactNode}) {

	const session = useSession()
	const path = usePathname()
	if (session.status === 'loading') return (<Loading message="Učitavanje" />)
	return (
		<>
			{!session.data ?
				<Error401 callbackUrl={path} />
				:
				<>
					<h1>Pozdrav, {session.data.user.name} {session.data.user.surname}!</h1>
					{children}
				</>}
		</>
	)
}

export function LoginRequired({children}: {children: React.ReactNode}) {
	const session = useSession()
	const path = usePathname()
	if (session.status === 'loading') return (<Loading message="Učitavanje" />)
	else if(!session.data) return <Error401 callbackUrl={path}/>
	else return <>{children}</>
}

export function EmployeesOnly({children}: {children: React.ReactNode}) {
	const session = useSession()
	if (session.status === 'loading') return (<Loading message="Učitavanje" />)
	else if(!session.data) return <Error401/>
	else if(session.data.user.role_id===2) return <Error403/>
	else return <>{children}</>
}

export function ParticularDepartmentOnly({id, children}: {id: number, children?: React.ReactNode}) {
	const session = useSession()
	const path = usePathname()
	if (session.status === 'loading') return (<Loading message="Učitavanje" />)
	else if(!session.data) return <Error401 callbackUrl={path}/>
	else if(session.data.user.role_id===1) return <Error403/>
	else if(session.data.user.role_id && session.data.user.role_id!==2) {
		if(session.data.user.department_id!==id) return <Error403/>
		else return <>{children}</>
	}
	else return <>{children}</>
}

export function AdminOnly({children}: {children: React.ReactNode}) {
	const session = useSession()
	if (session.status === 'loading') return (<Loading message="Učitavanje" />)
	else if(!session.data) return <Error401/>
	else if(session.data.user.role_id!==1) return <Error403/>
	else return <>{children}</>
}