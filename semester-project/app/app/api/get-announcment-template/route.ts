import { NextResponse } from "next/server";
import { getAnnouncmentTemplate } from "../../../lib/manage-announcments/db_queries";

export async function POST(req:Request) {
	const body = await req.json()
	try {
		const id = parseInt(body.id)
		if(isNaN(id)) return NextResponse.json({message: 'Unesen je neispravan oblik identifikatora objave'}, {status: 400})
		else {
			const announcment = await getAnnouncmentTemplate(id)
			if(!announcment) return NextResponse.json({message: 'Ne postoji zatražena objava'}, {status: 404})
			else return NextResponse.json({template: announcment}, {status: 200})
		}
	} catch(error) {
		console.error(error)
		return NextResponse.json({message: 'Dogodila se greška. Nije moguće dohvatiti konfiguraciju postojeće objave'}, {status: 500})
	}
}