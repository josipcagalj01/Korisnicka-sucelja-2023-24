import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { formSchema, inputTypes, Field } from "../../../lib/configureFormLib";
import { getSession } from "../../../lib/getSession";

export async function POST(req: Request) {
	const {id, ...rest} = await req.json()
	const {user} = await getSession() || {user: null}
	try {
		const {thumbnail, ...validated} = await formSchema.parseAsync(rest)
		let data: any = {}

		const existingForm = await db.form.findUnique({where: {id: id}})
		if(!existingForm) return NextResponse.json({message: 'Ne postoji taj obrazac'}, {status: 400})
		else if(existingForm.department_id !== user?.department_id && user?.role_id && user?.role_id!==2) 
			return NextResponse.json({message: 'Ovaj obrazac smiju uređivati samo zaposlenici za potrebe čijeg upravnog odjela je on napravljen.'},{status: 403})  
		else {
			if(existingForm.title !== validated.title) {
				const a = await db.form.findUnique({select: {id:true}, where: {title: validated.title, NOT: {id: {equals: id}}}})
				if(a) return NextResponse.json({message: 'Već postoji obrazac s tim naslovom. Odaberite drugi naslov'}, {status: 409})
			}

			let recordsExist : boolean
			if(validated.sketch) {
				const [{count}, ...rest] : any[] = await db.$queryRawUnsafe(`SELECT COUNT(*) from Form${id};`)
				recordsExist = Number(count) ? true : false
			}
			else recordsExist = false

			Object.entries(validated).map(([key, value])=>{
				if(key==='fields') {
					if(!recordsExist) {
						if(JSON.stringify(value) !== JSON.stringify(existingForm[key])) data[key] = value
					}
				}
				else if(key==='sketch') {
					if(existingForm.sketch) {
						if(!validated.sketch) data.sketch = false
					}
				}
				else if(key==='rate_limit') {
					if(parseInt(value as string)!==existingForm.rate_limit) {
						if(!value) data.rate_limit = null
						else data.rate_limit = parseInt(value as string)
					}
				}
				else if(['avalible_from', 'avalible_until'].includes(key)) {
					if(JSON.stringify(value) !== JSON.stringify(existingForm[key as keyof typeof existingForm])) {
						if(value) data[key] = value
					}
				}
				else if(key==='thumbnail_setting') {
					if(existingForm[key as keyof typeof existingForm] !== value) {
						if(value!=='default') data[key] = 'existing'
					}
				}
				else if(key==='thumbnail_id') {
					if(!value) data[key] = null
					else {
						if(existingForm[key as keyof typeof existingForm] !== value) data[key] = value
					}
				}
				else {
					if(JSON.stringify(value) !== JSON.stringify(existingForm[key as keyof typeof existingForm])) data[key] = value
				}
			})
			const a = new Error('Dogodila se greška')
	
			const updatedForm = await db.form.update({data: data, where: {id: existingForm.id}})

			if('sketch' in data && data.sketch) {
				const query =
				`CREATE TABLE if not exists Form${id} (
					id serial primary key,
					user_id serial references public.user(id),
					config_id serial references form(id),
					${(updatedForm.fields as Field[]).map((field: any, index:number) => {
						const {dbType} = inputTypes.find(({type})=>type===field.inputType) || {}
						return `a${index} ${dbType} ${field.required === 'yes' ? 'NOT NULL' : ''}`
					})}
				);`
				await db.$queryRawUnsafe(query)
			}

			return NextResponse.json({message: 'Promjene su uspješno spremljene'}, {status: 200})
		}
	}catch(error) {
		console.error(error)
		return NextResponse.json({message: 'Dogodila se greška. Nije moguće pohraniti promjene.'}, {status: 500})
	}
}