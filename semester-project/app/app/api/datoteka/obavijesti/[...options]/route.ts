import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { MultipleParams } from "../../../../../lib/interfaces";
import { getSession } from "../../../../../lib/getSession";
import { transformStr } from "../../../../../lib/otherFunctions";

export async function GET(req: Request, { params }: { params: MultipleParams }) {

	try {
		const { user } = await getSession() || { user: null }
		if (!isNaN(parseInt(params.options[0]))) {
			const announcmentId = parseInt(params.options[0])

			const announcment = await db.announcment.findUnique({
				select: {
					thumbnail: { select: { name: true } },
					attachments: true,
					sketch: true,
					department_id: true,
					department: {
						select: {name: true}
					},
					category: {select: {name: true}}
				},
				where: { id: announcmentId }
			})

			if (!announcment || announcment.sketch && user?.role_id !== 1 && user?.role_id !== 3 && user?.department_id !== announcment.department_id) return NextResponse.json({ message: 'Ne postoji zatrazena obavijest' }, { status: 404 })
			else {
				if (params.options[1] === 'minijatura') {
					const fetched_thumbnail = await fetch(`${process.env.VERCEL_BLOB_URL}/form-thumbnails/${announcment.thumbnail?.name}`)
					const headers = new Headers()
					headers.set("Content-Type", fetched_thumbnail.headers.get("Content-Type") || '')
					headers.set('Content-Disposition', fetched_thumbnail.headers.get("Content-Disposition") || '')
					return new NextResponse(fetched_thumbnail.body, { status: 200, headers: headers })
				}
				else if (params.options[1] === 'privitci') {
					if (params.options[2]) {
						const id = parseInt(params.options[2])
						if (isNaN(id)) return NextResponse.json({ message: 'Ne postoji zatražena datoteka' }, { status: 404 })
						else {
							const file = await fetch(`${process.env.VERCEL_BLOB_URL}/obavijesti/${transformStr(announcment.category.name)}/${transformStr(announcment.department.name)}/${announcmentId}/${announcment.attachments.find((a) => a.id === id)?.name}`)
							const headers = new Headers()
							headers.set("Content-Type", file.headers.get("Content-Type") || '')
							headers.set('Content-Disposition', file.headers.get("Content-Disposition") || '')
							return new NextResponse(file.body, { status: 200, headers: headers })
						}
					}
					else return NextResponse.json({ message: "Nisu navedeni svi potrebni parametri." }, { status: 400 })
				}
			}
		}
		else if (params.options[0] === 'minijature') {
			const id = parseInt(params.options[1])
			if (isNaN(id)) return NextResponse.json({ message: 'Nije pronađena tražena datoteka' }, { status: 404 })
			else {
				const { name } = await db.thumbnail.findUnique({ where: { id: id } }) || { name: null }
				if (!name) return NextResponse.json({ message: 'Nije pronađena tražena datoteka' }, { status: 404 })
				else {
					const fetched_thumbnail = await fetch(`${process.env.VERCEL_BLOB_URL}/form-thumbnails/${name}`)
					const headers = new Headers()
					headers.set("Content-Type", fetched_thumbnail.headers.get("Content-Type") || '')
					headers.set('Content-Disposition', fetched_thumbnail.headers.get("Content-Disposition") || '')
					return new NextResponse(fetched_thumbnail.body, { status: 200, headers: headers })
				}
			}
		}
		else return NextResponse.json({ message: "Nisu navedeni svi potrebni parametri." }, { status: 400 })
	} catch (error) {
		console.error(error)
		return NextResponse.json({ message: "Dogodila se greška! Nije moguće dohvatiti datoteku." }, { status: 500 })
	}
}