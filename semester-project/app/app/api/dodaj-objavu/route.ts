import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { formSchema } from "../../../lib/manage-announcments/add-update-announcment-lib";
import { getSession } from "../../../lib/getSession";

export async function POST(req:Request) {
	const body = await req.json();
	try {
		const {user} = await getSession() || {user: null}
		const validated = await formSchema.parseAsync(body)
		if(user?.role_id!==1 && user?.role_id!==3) {
			if(validated.department_id !== user?.department_id) return NextResponse.json({message: 'Nemate pravo dodati objavu koja nije povrzana s vašim upravnim odjelom ili ustanovom/tvrtkom.'}, {status: 409})
		}
		else {
			if(validated.form_id) {
				const form = await db.form.findUnique({where: {id: validated.form_id}})
				if(!form) return NextResponse.json({message: 'Objavi je priložen nepostojeći obrazac.'}, {status: 400})
				else if(form.department_id!==validated.department_id) return NextResponse.json({message: 'Objavi ne smije biti priložen obrazac drugog upravnog odjela ili druge ustanove/tvrtke.'}, {status: 400})
				else if(form.category_id!==validated.category_id) return NextResponse.json({message: 'Objavi ne smije biti priložen obrazac čija se kategorija razlikuje od kategorije te objave.'}, {status: 400})
			}
		const {department_id, category_id, thumbnail, attachments, thumbnail_setting, thumbnail_id, form_id, attach_form, existing_attachments, ...rest} = validated
			let data : any = {
				date: new Date(Date.now()),
				category: {
					connect: {
						id: validated.category_id
					}
				},
				department: {
					connect: {
						id: validated.department_id
					}
				},
				...rest
			}
			data.thumbnail_setting = thumbnail_setting === 'new' ? 'default' : thumbnail_setting
			if(thumbnail_id) data.thumbnail = {connect: {id: thumbnail_id}}
			if(form_id) data.form = {connect: {id: form_id}}
			const {id} = await db.announcment.create({data: data})
			return NextResponse.json({message: 'Objavlja je uspješno spremljena.', newAnnouncmentId: id}, {status: 201})
		}
	} catch(error) {
		console.error(error)
		return NextResponse.json({message: 'Dogodila se greška. Nije moguće spremiti objavu!'}, {status: 500})
	}
}