import { db } from '../../../lib/db'
import { NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import * as z from 'zod'
import { getSession } from '../../../lib/getSession'

const userSchema = z.object({
	id: z.number(),
	email: z.string().min(1, 'Potrebno je upisati novu adresu e-pošte.').email('Neispravno upisana adresa-e pošte'),
	password: z.string().min(1, 'Potrebno je unijeti lozinku')
})

export async function POST(req: Request) {
	try {
		
		const body = await req.json()
		const { id, email, password } = userSchema.parse(body);

		const user = await db.user.findUnique({ where: { id: id } })
		if (!user) {
			return NextResponse.json({ user: null, message: 'Ne postoji korisnički račun čija se adresa e-pošte pokušava promijeniti' }, { status: 404 })
		}

		const userWithDesiredEmail = await db.user.findUnique({ where: { email: email } })
		
		if (userWithDesiredEmail) {
			const { password: newUserPassword, ...rest } = user
			if (userWithDesiredEmail.id === user.id) return NextResponse.json({ user: rest, message: 'Unesena adresa e-pošte se ne razlikuje od prethodne.' }, { status: 201 })
			else return NextResponse.json({ user: rest, message: 'Već postoji korisnik s tom adresom e-pošte.' }, { status: 409 })
		}
		
		const session = await getSession()
		if(session?.user.role_id!=0) {
			const passwordMatch = await compare(password, user.password)
			if (!passwordMatch ) return NextResponse.json({ message: 'Unesena lozinka nije ispravna' }, { status: 401 })
		}
	
		const updatedUser = await db.user.update({ where: { id: id }, data: { email: email } })

		const { password: newUserPassword, ...rest } = updatedUser
		return Response.json({ user: rest, message: 'Adresa e-pošte uspješno promijenjena' }, { status: 201 })
	} catch (error) {
		return NextResponse.json({ message: "Dogodila se greška!" }, { status: 500 })
	}
}