import {authOptions} from '../lib/auth'
import { getServerSession } from 'next-auth'
import {cache} from 'react'

interface User {
	id: number,
	pin: string,
	name: string,
	surname: string,
	address: string,
	category: number,
	email: string,
	username: string
}
export interface Session {
	user: User
}

const getSession= cache(async ():Promise<Session | null> => {
    const session = await getServerSession(authOptions)
    return session
})

export {getSession}