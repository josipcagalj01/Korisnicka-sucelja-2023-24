import {authOptions} from './auth'
import { getServerSession } from 'next-auth'
import {cache} from 'react'

interface User {
	id: number,
	pin: string,
	name: string,
	surname: string,
	street: string,
  house_number: string,
  place: string,
  town: string
	department_id?: number,
	role_id:number,
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