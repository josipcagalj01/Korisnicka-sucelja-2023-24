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
		else if(user.role_id===1) {
			const adminCount = await db.user.count({where: {role: {id: 1}}})
			if(adminCount === 1) return NextResponse.json({ user: null, message: 'Sustav mora imati barem jednog administratora.' }, { status: 409 })
		}
		const formsCount = await db.form.count({where: {author: {id: id}}})
		if(formsCount) return NextResponse.json({ user: null, message: 'Trenutno nije moguće ukloniti račun zbog s njime povezanih podataka. Obratite se korisničkoj podršci ili admininistratoru sustava za daljnje korake.' }, { status: 409 })
		const submissionsCount = await db.submission.count({where: {user: {id: id}}})
		if(submissionsCount) return NextResponse.json({ user: null, message: 'Trenutno nije moguće ukloniti račun zbog s njime povezanih podataka. Obratite se korisničkoj podršci ili admininistratoru sustava za daljnje korake.' }, { status: 409 })
		
		const session = await getSession()
		if (session?.user.role_id!==1) {
			const passwordMatch = await compare(password, user.password)
			if (!passwordMatch) return NextResponse.json({ message: 'Unesena lozinka nije ispravna' }, { status: 401 })
		}

		await db.user.delete({ where: { id: id } })

		return NextResponse.json({ user: null, message: 'Korisnički račun uklonjen.' }, { status: 200 })
	} catch (error) {
		console.error(error)
		return NextResponse.json({ message: "Dogodila se greška!" }, { status: 500 })
	}
}