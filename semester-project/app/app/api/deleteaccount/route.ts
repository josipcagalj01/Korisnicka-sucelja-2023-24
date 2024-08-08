import { db } from '../../../lib/db'
import { NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import * as z from 'zod'
import { getSession } from 'next-auth/react'

const userSchema = z.object({
	id: z.number(),
	password: z.string().min(1, 'Potrebno je unijeti lozinku')
})

export async function POST(req: Request) {
	try {

		const body = await req.json()
		const { id, password } = userSchema.parse(body);

		const user = await db.user.findUnique({ where: { id: id } })
		if (!user) {
			return NextResponse.json({ user: null, message: 'Ne postoji korisnički račun koji se pokušava ukloniti.' }, { status: 404 })
		}
		const session = await getSession()
		if (session?.user.role_id != 0) {
			const passwordMatch = await compare(password, user.password)
			if (!passwordMatch) return NextResponse.json({ message: 'Unesena lozinka nije ispravna' }, { status: 401 })
		}

		await db.user.delete({ where: { id: id } })

		return Response.json({ user: null, message: 'Korisnički račun uklonjen.' }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ message: "Dogodila se greška!" }, { status: 500 })
	}
}