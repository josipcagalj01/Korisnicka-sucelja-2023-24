import {db} from '../../../lib/db'
import { NextResponse } from 'next/server'
import { formSchema	} from '../../../lib/configureFormLib'
import { getSession } from '../../../lib/getSession'

export async function POST(req:Request) {
	let formId = 0
	const {avalible_from, avalible_until, ...rest} = await req.json()
	const toValidate = {avalible_from: avalible_from ? new Date(avalible_from) : null, avalible_until: avalible_until ? new Date(avalible_until) : null, ...rest}
	try {
		const session = await getSession()
		if(session?.user.role_id===2) return NextResponse.json({message: 'Samo zaposlenici smiju dodavati obrasce!'}, {status:401})
		else {
			const {department_id, category_id, avalible_from, avalible_until, rate_limit, thumbnail, thumbnail_id, thumbnail_setting, title, ...rest } = await formSchema.parseAsync(toValidate)
			const titleExist = await db.form.findUnique({select: {id: true}, where: {title: title}})
			if(department_id!==session?.user.department_id && session?.user.role_id!==1) return NextResponse.json({message: 'Možete dodati samo obrasce koji prikupljaju podatke namijenjene vašem odjelu.'}, {status: 409})
			if(titleExist) return NextResponse.json({message: 'Već postoji obrazac s tim naslovom. Odaberite drugi naslov'}, {status: 409})
			else {
				let data:any = {
					department: {connect: {id: department_id} },
					author: { connect: { id: session?.user.id} },
					category: { connect: { id: category_id} },
					thumbnail_setting: thumbnail_setting === 'new' ? 'default' : thumbnail_setting,
					...rest
					
				}
				if(avalible_from) data.avalible_from = new Date(avalible_from).getTime() < Date.now() ? new Date(Date.now()).setSeconds(0) : new Date(avalible_from)
				if (avalible_until) data.avalible_until = new Date(avalible_until)
				if(rest.rate_limit_set) data.rate_limit = rate_limit
				if(thumbnail_setting === 'existing') data.thumbnail = {connect: {id: thumbnail_id}}

				const {id} = await	db.form.create({data: data})
				formId = id
				return NextResponse.json({message: 'Obrazac uspješno dodan.', newFormId: id}, {status: 201})
			}
		}
	} catch(error) {
			console.error(error)
			return NextResponse.json({message: 'Dogodila se greška pri pohrani obrasca!'}, {status:500})
	}
}