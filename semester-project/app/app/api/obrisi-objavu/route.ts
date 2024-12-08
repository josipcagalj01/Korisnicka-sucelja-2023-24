import { db } from "../../../lib/db";
import { getSession } from "../../../lib/getSession";
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { transformStr } from "../../../lib/otherFunctions";

export async function POST(req: Request) {
	const body = await req.json()
	try {
		const {user} = await getSession() || {user: null}
		const id = parseInt(body.id)
		if(isNaN(id)) return NextResponse.json({message: 'Priložen je neispravan oblik oznake objave'}, {status: 400})
		else {
			const announcment = await db.announcment.findUnique({
				where: {id: id},
				select: {
					department: true,
					category: true,
					attachments: {
						select: {
							name:true
						}
					}
				}
			})
			if(!announcment) return NextResponse.json({message: 'Ne postoji zatražena objava'}, {status: 400})
			else if(announcment.department.id!==user?.department_id && user?.role_id!==1 && user?.role_id!==3) return NextResponse.json({message: 'Nemate pravo ukloniti ovu objavu.'}, {status: 403})
			
			else {
				for(let i=0; i< announcment.attachments.length; i++) await del(`obavijesti/${transformStr(announcment.category.name)}/${transformStr(announcment.department.name)}/${id}/${announcment.attachments[i].name}`)
				await db.$transaction([
					db.announcment_attachment.deleteMany({where: {announcment: {id: id}}}),
					db.announcment.delete({where: {id: id}})
				])
			}
			return NextResponse.json({message: 'Objava je uspješno obrisana'}, {status: 200})
		}
	} catch(error) {
		console.error(error)
		return NextResponse.json({message: 'Dogodila se greška. Nije moguće ukloniti obrazac'}, {status: 500})
	}
}