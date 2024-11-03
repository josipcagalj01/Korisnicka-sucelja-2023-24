import { db } from "../db";
import { getSession } from "../getSession";
import type * as Prisma from '@prisma/client'

export async function getUserForMetadata(id: number) {
	try {
		const {user} = await getSession() || {user: null}
		if(user?.role_id!==1) return null
		else if(isNaN(id)) return null
		else {
			const user = await db.user.findUnique({select: {name: true, surname: true}, where: {id: id}})
			return user
		}
	} catch(error) {
		console.error(error)
		return null
	}
}

export async function getUserToDelete(id: number) {
	try {
		const {user} = await getSession() || {user: null}
		if(user?.role_id!==1) return null
		else if(isNaN(id)) return null
		else {
			const user = await db.user.findUnique({select: {id:true, name: true, surname: true, pin: true}, where: {id: id}})
			return user
		}
	} catch(error) {
		console.error(error)
		return null
	}
}

export type User = Omit<Prisma.user, 'role_id' | 'department_id' | 'password'> & {department: Prisma.department | null} & {role: Prisma.role}

export async function getUserForForm(id: number) : Promise<User | null> {
	try {
		const {user} = await getSession() || {user: null}
		if(user?.role_id!==1) return null
		else if(isNaN(id)) return null
		else {
			const user = await db.user.findUnique({
				select: {
					id: true,
					pin:true,
					email:true,
					username:true,
					name: true,
					surname: true,
					role: {
						select: {
							id:true,
							name: true
						}
					},
					department: {
						select: {
							id:true,
							name: true
						}
					},
					birth_date: true,
					place: true,
					street: true,
					house_number: true,
					town: true,
					password: false
				},
					where: {
						id: id
					}
				}
			)
			return user
		}
	} catch(error) {
		console.error(error)
		return null
	}
}

export async function getUsersCount(role_id?: number, department_id?:number, IstLetterName?: string, IstLetterSurname?: string) : Promise<number | null> {
	const {user} = await getSession() || {user: null}
	if(user?.role_id!==1) return null
	else {
		let where:any={}
		if(role_id && !isNaN(role_id)) where.role = {id: role_id}
		if(department_id && !isNaN(department_id)) where.department = {id: department_id}
		if(IstLetterName) where.name = {startsWith: IstLetterName, mode: 'insensitive'}
		if(IstLetterSurname) where.surname = {startsWith: IstLetterSurname, mode: 'insensitive'}
		try {
			const count = await db.user.count({where:where})
			return count
		} catch(error) {
			console.error(error)
			return null
		}
	}
} 

export async function getUsers(page?:number, limit?:number, role_id?: number, department_id?:number, IstLetterName?: string, IstLetterSurname?: string) {
	try {
		const {user} = await getSession() || {user: null}
		if(user?.role_id!==1) return null
		else {
			let where:any={}
			if(role_id && !isNaN(role_id)) where.role = {id: role_id}
			if(department_id && !isNaN(department_id)) where.department = {id: department_id}
			if(IstLetterName) where.name = {startsWith: IstLetterName, mode: 'insensitive'}
			if(IstLetterSurname) where.surname = {startsWith: IstLetterSurname, mode: 'insensitive'}
			const user = await db.user.findMany({
				select: {
					id: true,
					name:true,
					surname: true,
					pin: true,
					role: {
						select: {
							name: true,
							id: true
						}
					},
					department: {
						select: {
							id: true,
							name: true
						}
					}
				},
				orderBy: [
					{surname: 'asc'},
					{name: 'asc'}
				],
				skip: ( (page && limit) && (!isNaN(page) && !isNaN(limit)) ) ? (page-1)*limit : undefined,
				take: ( (page && limit) && (!isNaN(page) && !isNaN(limit)) ) ? limit : undefined,
				where: where
			})
			return user
		}
	} catch(error) {
		console.error(error)
		return null
	}
}