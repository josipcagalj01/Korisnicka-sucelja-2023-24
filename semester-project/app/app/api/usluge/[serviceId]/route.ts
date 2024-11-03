import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { Field } from "../../../../lib/configureFormLib";
import { generateZodSchema } from "../../../../lib/renderFormLib";
import { getSession } from "../../../../lib/getSession";
import { getRate } from "../../../../lib/db_qurery_functions";
import type * as Prisma from '@prisma/client'

export interface serviceParams {
	serviceId:string
}

export async function POST(req:Request, {params}: {params:serviceParams}) {
	const formId = Number.parseInt(params.serviceId)
	if(isNaN(formId)) return NextResponse.json({message: 'Unesen je neispravan oblik identifikatora usluge.'}, {status:400})
	
	let savedSubmission : Prisma.submission | null = null

	const session = await getSession()
	
	try {
		const body = await req.json()
		//const data = body.getAll('json')
		
		const {id, fields, rate_limit, avalible_from, avalible_until} = await db.form.findUnique({
			select: {
				id:true,
				rate_limit:true,
				fields:true,
				avalible_from: true,
				avalible_until: true
			},
			where: {id:formId}
		}) || {}

		if(rate_limit) {
			const rate = await getRate(id)
			if(rate<0) return NextResponse.json({message: 'Sustav ne može pohraniti Vašu prijavu.'}, {status:500})
			else if(rate >=rate_limit) return NextResponse.json({message: `Korisnik ${session?.user.name} ${session?.user.surname} je ispunio obrazac već ${rate} puta. Nema pravo ponovo ispuniti obrazac.`}, {status:409})
		}
		else if(avalible_from) {
			const timeFormat : any = {hour: "2-digit", minute: "2-digit"}
			if(avalible_from.getTime()>=Date.now()) return NextResponse.json(
				{message: `Obrazac se otvara ${avalible_from?.toLocaleDateString()} u ${avalible_from?.toLocaleTimeString('hr-HR',timeFormat)}. Na žalost, ovaj obrazac još nije raspoloživ.`},
				{status:409}
		)}
		else if(avalible_until) {
			const timeFormat : any = {hour: "2-digit", minute: "2-digit"}
			if(avalible_until.getTime()<Date.now())
				return NextResponse.json(
					{message: `Obrazac je zatvoren ${avalible_until?.toLocaleDateString()} u ${avalible_until?.toLocaleTimeString([],timeFormat)} Na žalost, ovaj obrazac više nije raspoloživ..`},
					{status:409}
		)}
		
		const {schema} = generateZodSchema(fields as Field[])
				
		const validatedRequest = await schema.parseAsync(body)
		
		let data_for_db : any = {};

		(fields as Field[])?.map((field,index, {length})=>{
			const key = `a${index}`
			if(field.inputType==='int') {
				if(Number.isNaN(Number.parseInt(validatedRequest[key])) || validatedRequest[key]==='') data_for_db[key]=null
				else data_for_db[key]=parseInt(validatedRequest[key])
			}
			else if(field.inputType==='float') {
				if(validatedRequest[key]==='') data_for_db[key]=null
				else if(new RegExp(/^\d+(,\d+)*(\.\d+)?$/).test(validatedRequest[key])) {
					const parsed = parseFloat(validatedRequest[key].replaceAll(',',''))
					if(isNaN(parsed)) data_for_db[key]=null
					else data_for_db[key] = parsed
				}
				else if(new RegExp(/^\d+(\.\d+)*(,\d+)?$/).test(validatedRequest[key])) {
					const parsed = parseFloat(validatedRequest[key].replaceAll('.','').replaceAll(',','.'))
					if(isNaN(parsed)) data_for_db[key]=null
					else data_for_db[key] = parsed
				}
				if(Number.isNaN(Number.parseInt(validatedRequest[key])) || validatedRequest[key]==='') data_for_db[key]=null
				else data_for_db[key]=parseInt(validatedRequest[key])
			}
			else if(field.inputType === 'checkbox') data_for_db[key] = validatedRequest[key]
			else {
				if(validatedRequest[key]!='') data_for_db[key] = validatedRequest[key]
				else data_for_db[key]=null
			}	
		})
		
		savedSubmission = await db.submission.create({
			data: {
				form: {
					connect: {id: id}
				},
				user: {
					connect: {id: session?.user.id}
				},
				data: data_for_db,
				time: new Date(Date.now()),
				success: true
			}
		})
		
		return NextResponse.json({message: 'Prijava je uspješno spremljena.', submission_id: savedSubmission.id}, {status:201})
	} catch(error) {
		if(savedSubmission) await db.submission.delete({where: {id: savedSubmission.id}})
		console.error(error)
		return NextResponse.json({message: 'Sustav ne može pohraniti Vašu prijavu.'}, {status:500})
	}
}