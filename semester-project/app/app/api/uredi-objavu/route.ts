import { db } from "../../../lib/db";
import { formSchema } from "../../../lib/manage-announcments/add-update-announcment-lib";
import { getSession } from "../../../lib/getSession";
import { NextResponse } from "next/server";
import { del } from '@vercel/blob'

export async function POST(req: Request) {
	try {
		const {id, ...body} = await req.json()
		const {user} = await getSession() || {user:null}
		if(isNaN(id)) return NextResponse.json({message: 'Naveden je neispravan oblik oznake objave.'}, {status: 400})
		else {
			const validated = await formSchema.parseAsync(body)
			let data: any = {}
			let filesToDelete : number[] = []
			const announcment = await db.announcment.findUnique({
				where: {id: id},
				select: {
					id: true,
					title: true,
					thumbnail_id: true,
					form_id: true,
					form: {
						select: {
							id: true,
							category_id: true
						}
					},
					attachments: true,
					thumbnail_setting: true,
					department_id: true,
					category_id: true,
					content: true,
				}
			})
			if(!announcment) return NextResponse.json({message: 'Ne postoji tražena objava.'}, {status: 400})
			else if(announcment.department_id!==user?.department_id && user?.role_id!==1 && user?.role_id!==3) return NextResponse.json({message: 'Nemate pravo uređivati objavu tuđeg upravnog odjela, tvrtke ili ustanove.'}, {status: 403})
			else {
				const {thumbnail, attachments, attach_form, ...rest} = validated

				Object.entries(rest).map(([key, value])=>{
					if(key==='thumbnail_setting') {
						if(announcment[key as keyof typeof announcment] !== value) {
							if(value==='new') data[key] = 'default'
							else data[key] = value
						}
					}
					else if(key==='thumbnail_id') {
						const thumbnail_id : number | null = !value ? null : value as number
						if(announcment[key as keyof typeof announcment] !== thumbnail_id) {
							if(!thumbnail_id) data['thumbnail'] = {disconnect: true}
							else data.thumbnail = {connect: {id: value}}
						}
					}
					else if(key==='department_id') {
						if(user?.department_id===value || user?.role_id===1 || user?.role_id===3) {
							if(announcment[key as keyof typeof announcment] !== value) {
								data.thumbnail = {connect: {id: value}}
							}
						}
					}
					else if(key==='category_id') {
						if(announcment.category_id!==value) {
							if(announcment.form) {
								if(announcment.form.category_id!==value) data.form = {disconnect: true}
							}
							data.category = {connect: {id: value}}
						}
					}
					else if(key==='existing_attachments') {
						if(value.length!== announcment.attachments.length) {
							filesToDelete = announcment.attachments.map(({id})=>id).filter(id=>value.includes(id))
						}
					}
					else {
						if(JSON.stringify(value) !== JSON.stringify(announcment[key as keyof typeof announcment])) data[key] = value
					}
				})
				await db.announcment.update({where: {id: id}, data: data})

				if(filesToDelete.length) {
					const ids = filesToDelete.map((id)=>({id: id}))
					const unusedFiles = await db.announcment_attachment.findMany({where: {OR: ids}})
					for(let i=0;i<unusedFiles.length;i++) await del('announcment_attachments/'+unusedFiles[i].name)
					await db.announcment_attachment.deleteMany({where: {OR: ids}})
				}

				return NextResponse.json({message: 'Promjene su uspješno spremljene.'}, {status: 200})
			}
		}

	} catch(error) {
		console.error(error)
		return NextResponse.json({message: 'Dogodila se greška. Nije moguće spremiti promjene.'}, {status: 500})
	}
}