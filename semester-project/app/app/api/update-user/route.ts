import { db } from '../../../lib/db'
import { NextResponse } from "next/server";
import { formSchema } from "../../../lib/manage-users/updateUserLib";
import { getSession } from "../../../lib/getSession";
import { hash, genSalt} from "bcrypt";

export async function POST(req:Request) {
	const session = await getSession()
	if(session?.user.role_id!==1) return NextResponse.json({message: 'Samo administratori smiju mijenjati osobitosti tuđih računa.'}, {status: 401})
	else {
		const {id, ...rest1} = await req.json()
		if(isNaN(id)) return NextResponse.json({message: 'Jedinstvena oznaka korisnika nema ispravan oblik'}, {status: 400})
		else {
			try {
				const existingUser = await db.user.findUnique({where: {id:id}})
				if(existingUser) {
					const validatedRequest = await formSchema.parseAsync(rest1)
					let data : any = {}
					const {id, password, pin, birth_date, department_id, ...rest} = existingUser
					Object.entries(rest).forEach(([key, value])=>{
						if(value !== validatedRequest[key as keyof typeof validatedRequest]) data[key] = validatedRequest[key as keyof typeof validatedRequest]
					})
					if(validatedRequest.department_id !== department_id) data.department = {disconnect: true}
					if(validatedRequest.password) {
						const salt = await genSalt(10)
						const hashedPassword = await hash(validatedRequest.password, salt)
						data.password=hashedPassword
					}
					
					if(Object.entries(data).length) await db.user.update({where: {id:id}, data:data})
					return NextResponse.json({message: 'Promjene su uspješno spremljene.'}, {status: 200})
				}
				else return NextResponse.json({message: 'Ne postoji korisnički racun s priloženim id-em.'}, {status: 400})
			} catch(error) {
				console.error(error)
				return NextResponse.json({message: 'Dogodila se greška. Nije moguće pohraniti promjene.'}, {status: 500})
			}
		}
	}
}