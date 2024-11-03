import { NextResponse } from "next/server"
import { getSession } from "../../../../../lib/getSession"
import { db } from "../../../../../lib/db"
import { Params } from "../../../../../lib/interfaces"
import { transformStr } from "../../../../../lib/otherFunctions"

export async function GET(req: Request, {params}: {params:Params}) {
	const attachment_id = parseInt(params.option)
	if(isNaN(attachment_id)) return NextResponse.json({ message: "Naveden je pogrešan oblik identifikatora datoteke." }, { status: 400 })
	else {
		try {
			const {user} = await getSession() || {user: null}
			const {submission, name} = await db.submission_attachment.findUnique({
				where: {
					id: attachment_id
				},
				select: {
					submission: {
						select: {
							id: true,
							form: {
								select: {
									id: true,
									department:true,
									category: true
								}
							}
						}
					},
					name: true
				}
			}) || {submission: null, name: null}

			if(!(submission || name)) return NextResponse.json({ message: "Ne postoji zatražena datoteka." }, { status: 404 })
			else if((user?.role_id!==1 && user?.role_id!==3) && user?.department_id!==submission.form.department.id) return new NextResponse(null,{ status: 404 })
			else {
				const {form} = submission
				const file = await fetch(process.env.VERCEL_BLOB_URL + '/' + [transformStr(form.category.name), transformStr(form.department.name), form.id, submission.id, name].join('/'))
				const headers = new Headers()
				headers.set("Content-Type", file.headers.get("Content-Type") || '')
				headers.set('Content-Disposition', file.headers.get("Content-Disposition") || '')
				return new NextResponse(file.body, {status: 200, headers: headers})
			}
		} catch(error) {
			console.error(error)
			return NextResponse.json({ message: "Dogodila se greška pri pkušaju dohvata datoteke." }, { status: 500 })
		}
	}
}