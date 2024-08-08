import { db } from '../../../lib/db'
import { NextResponse } from 'next/server'
import { hash, compare, genSalt } from 'bcrypt'
import * as z from 'zod'
import { getSession } from '../../../lib/getSession'

const userSchema = z.object({
	id: z.number(),
	oldpassword: z.string().min(1, 'Potrebno je unijeti lozinku').min(7, 'Lozinka mora imati barem 8 znakova'),
	password: z.string().min(1, 'Potrebno je unijeti lozinku').min(7, 'Lozinka mora imati barem 8 znakova')
})

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { id, oldpassword, password } = userSchema.parse(body);

		const user = await db.user.findUnique({ where: { id: id } })
		if (!user) {
			return NextResponse.json({ user: null, message: 'Ne postoji korisnički račun čiju se lozinku pokušava promijeniti' }, { status: 404 })
		}

		const session = await getSession()
		if(session?.user.role_id!=0) {
			const oldPasswordMatch = await compare(oldpassword, user.password)
			if (!oldPasswordMatch) return NextResponse.json({ message: 'Unesena trenutna lozinka nije ispravna' }, { status: 401 })
		}

		const salt = await genSalt(10)
		const hashedPassword = await hash(password, salt)

		const updatedUser = await db.user.update({ where: { id: id }, data: { password: hashedPassword } })

		const { password: newUserPassword, ...rest } = updatedUser
		return Response.json({ user: rest, message: 'Lozinka uspješno promijenjena' }, { status: 201 })
	} catch (error) {
		return NextResponse.json({ message: "Dogodila se greška!" }, { status: 500 })
	}
}