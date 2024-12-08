import { db } from "../../../lib/db";
import { getSession } from "../../../lib/getSession";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const body = await req.json()
	try {
		const {user} = await getSession() || {user: null}
		const id = parseInt(body.id)
		if(isNaN(id)) return NextResponse.json({message: 'Priložen je neispravan oblik oznake obrasca'}, {status: 400})
		else {
			const form = await db.form.findUnique({
				where: {id: id},
				select: {
					department_id: true,
					submissions: {
						select: {
							id: true
						}
					}
				}
			})
			if(!form) return NextResponse.json({message: 'Ne postoji zatraženi obrazac'}, {status: 400})
			else if(form.department_id!==user?.department_id && user?.role_id!==1 && user?.role_id!==3) return NextResponse.json({message: 'Nemate pravo uklooniti ovaj obrazac.'}, {status: 403})
			else if(form.submissions.length) return NextResponse.json({message: 'Obrazac nije moguće ukloniti jer u sustavu postoje prijave nastale ispunjvanjem istog.'}, {status: 409})
			else {
				await db.$transaction([
					db.$queryRaw`UPDATE TABLE Announcment IF EXISTS SET Form_id=NULL WHERE Form_id=${id}`,
					db.form.delete({where: {id: id}})
				])
			}
		}
		return NextResponse.json({message: 'Objava je uspješno obrisana'}, {status: 200})
	} catch(error) {
		console.error(error)
		return NextResponse.json({message: 'Dogodila se greška. Nije moguće ukloniti obrazac'}, {status: 500})
	}
}