import { NextResponse } from "next/server";
import { getFormTemplate } from "../../../lib/db_qurery_functions";

export async function POST(req:Request) {
	const body = await req.json()
	try {
		const id = parseInt(body.id)
		if(isNaN(id)) return NextResponse.json({message: 'Unesen je neispravan oblik identifikatora obrasca'}, {status: 400})
		else {
			const form = await getFormTemplate(id)
			if(!form) return NextResponse.json({message: 'Ne postoji zatraženi obrazac'}, {status: 404})
			else return NextResponse.json({template: form}, {status: 200})
		}
	} catch(error) {
		console.error(error)
		return NextResponse.json({message: 'Dogodila se greška. Nije moguće dohvatiti konfiguraciju postojećeg obrasca'}, {status: 500})
	}
}