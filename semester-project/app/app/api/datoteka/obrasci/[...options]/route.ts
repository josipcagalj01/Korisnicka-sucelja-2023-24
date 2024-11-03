import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { MultipleParams } from "../../../../../lib/interfaces";

export async function GET(req: Request, {params}: {params: MultipleParams}) {
	if(params.options.length===2) {
		try {
			if(!isNaN(parseInt(params.options[0]))) {
				const id = parseInt(params.options[0])
				
				const {thumbnail} = await db.form.findUnique({select: {thumbnail: {select: {name: true}}} , where: {id: id}}) || {thumbnail: null}
				if(!thumbnail) return NextResponse.json({message: 'Nije pronađena tražena datoteka'}, {status: 404} )
				else {
					if(params.options[1]==='minijatura') {
						const fetched_thumbnail = await fetch(`${process.env.VERCEL_BLOB_URL}/form-thumbnails/${thumbnail.name}`)
						const headers = new Headers()
						headers.set("Content-Type", fetched_thumbnail.headers.get("Content-Type") || '')
						headers.set('Content-Disposition', fetched_thumbnail.headers.get("Content-Disposition") || '')
						return new NextResponse(fetched_thumbnail.body, {status: 200, headers: headers})
					}
					else return NextResponse.json({ message: "Nisu navedeni svi potrebni parametri." }, { status: 400 })
				}
			}
			else if(params.options[0]==='minijature') {
				const id = parseInt(params.options[1])
				if(isNaN(id)) return NextResponse.json({message: 'Nije pronađena tražena datoteka'}, {status: 404} )
				else {
					const {name} = await db.form_thumbnail.findUnique({where: {id: id}}) || {name: null}
					if(!name) return NextResponse.json({message: 'Nije pronađena tražena datoteka'}, {status: 404} )
					else {
						const fetched_thumbnail = await fetch(`${process.env.VERCEL_BLOB_URL}/form-thumbnails/${name}`)
						const headers = new Headers()
						headers.set("Content-Type", fetched_thumbnail.headers.get("Content-Type") || '')
						headers.set('Content-Disposition', fetched_thumbnail.headers.get("Content-Disposition") || '')
						return new NextResponse(fetched_thumbnail.body, {status: 200, headers: headers})
					}
				}
			}
			else return NextResponse.json({ message: "Nisu navedeni svi potrebni parametri." }, { status: 400 })
		} catch(error) {
			console.error(error)
			return NextResponse.json({ message: "Dogodila se greška! Nije moguće dohvatiti datoteku." }, { status: 500 })
		}
	}
	else return NextResponse.json({ message: "Nisu navedeni svi potrebni parametri." }, { status: 400 })
}