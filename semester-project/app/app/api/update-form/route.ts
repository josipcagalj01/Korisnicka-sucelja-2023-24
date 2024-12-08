import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { formSchema, inputTypes, Field, FieldsEqual } from "../../../lib/configureFormLib";
import { getSession } from "../../../lib/getSession";
import { getRate } from "../../../lib/db_qurery_functions";

export async function POST(req: Request) {
	const {id, ...rest} = await req.json()
	const {avalible_from, avalible_until, ...rest2} = rest
	
	const {user} = await getSession() || {user: null}
	try {
		const {thumbnail, ...validated} = await formSchema.parseAsync({avalible_from: avalible_from ? new Date(avalible_from) : null, avalible_until: avalible_until ? new Date(avalible_until) : null, ...rest2})
		let data: any = {}

		const existingForm = await db.form.findUnique({where: {id: id}})
		if(!existingForm) return NextResponse.json({message: 'Ne postoji taj obrazac'}, {status: 400})
		else if(existingForm.department_id !== user?.department_id && user?.role_id!==1 && user?.role_id!==3) 
			return NextResponse.json({message: 'Ovaj obrazac smiju uređivati samo zaposlenici za potrebe čijeg upravnog odjela je on napravljen.'},{status: 403})  
		else {
			let recordsExist : boolean
			if(!validated.sketch) {
				const rate = await getRate(id)
				recordsExist = rate ? true : false
			}
			else recordsExist = false

			Object.entries(validated).map(([key, value])=>{
				if(key==='fields') {
					if(!recordsExist) {
						if((value as Field[]).length !== (existingForm[key] as Field[]).length) data[key] = value
						else if(!((value as Field[])?.every((field: Field, index: number)=>FieldsEqual(field, (existingForm[key] as Field[])[index])))) data[key] = value
					}
				}
				else if(key==='sketch') {
					if(existingForm.sketch) {
						if(!validated.sketch) data.sketch = false
					}
				}
				else if(key==='rate_limit') {
					const rate_limit : number | null | undefined = !value ? null : value as number
					if(rate_limit!==existingForm.rate_limit) {
						if(!value) data.rate_limit = null
						else data.rate_limit = rate_limit
					}
				}
				else if(['avalible_from', 'avalible_until'].includes(key)) {
					if(JSON.stringify(value) !== JSON.stringify(existingForm[key as keyof typeof existingForm])) {
						if(!value) data[key] = null
						else data[key] = value
					}
				}
				else if(key==='thumbnail_setting') {
					if(existingForm[key as keyof typeof existingForm] !== value) {
						if(value==='new') data[key] = 'default'
						else data[key] = value
					}
				}
				else if(key==='thumbnail_id') {
					const thumbnail_id : number | null = !value ? null : value as number
					if(existingForm[key as keyof typeof existingForm] !== thumbnail_id) {
						if(!thumbnail_id) data['thumbnail'] = {disconnect: true}
						else data[key] = value
					}
				}
				else {
					if(JSON.stringify(value) !== JSON.stringify(existingForm[key as keyof typeof existingForm])) data[key] = value
				}
			})
			await db.form.update({data: data, where: {id: existingForm.id}})
			return NextResponse.json({message: 'Promjene su uspješno spremljene'}, {status: 200})
		}
	}catch(error) {
		console.error(error)
		return NextResponse.json({message: 'Dogodila se greška. Nije moguće pohraniti promjene.'}, {status: 500})
	}
}