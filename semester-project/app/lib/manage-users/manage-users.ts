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

export async function getUsers(page?:number, limit?:number, category?: number) {
	try {
		const {user} = await getSession() || {user: null}
		if(user?.role_id!==1) return null
		else {
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
				where: (category && !isNaN(category)) ? {role: {id: category}} : undefined
			})
			return user
		}
	} catch(error) {
		console.error(error)
		return null
	}
}