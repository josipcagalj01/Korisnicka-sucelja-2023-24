import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import * as z from 'zod'

const inputSchema = z.object({
	tableName: z.enum(['category', 'department', 'role', 'announcment_category'], {
		errorMap: (issue, _ctx) => {
			switch (issue.code) {
				case 'invalid_type':
					return { message: 'Imena tablica ne označavaju se na uneseni način.' };
				case 'invalid_enum_value':
					return { message: 'Odabrana je nedopušten tablica.' };
				default:
					return { message: 'Odabrana je nedopušten tablica.' };
			}
		},
	})
})

export async function POST(req:Request) {
	const body : {tableName:string} = await req.json()
	try {
		const {tableName} = inputSchema.parse(body)

		if(tableName in db) {
			switch(tableName) {
				case 'category':
					const response = await db.category.findMany({orderBy:[{name:'asc'}]})
					return NextResponse.json({message:'Ok', array:response}, {status:200})
				case 'department':
					const response2 = await db.department.findMany({orderBy:[{name:'asc'}]})
					return NextResponse.json({message:'Ok', array:response2}, {status:200})
				case 'role':
					const response3 = await db.role.findMany({orderBy:[{name:'asc'}]})
					return NextResponse.json({message:'Ok', array:response3}, {status:200})
				case 'announcment_category':
					const response4 = await db.role.findMany({orderBy:[{name:'asc'}]})
					return NextResponse.json({message:'Ok', array:response4}, {status:200})
				default:
					return NextResponse.json({message:'Odabrana je nedopuštena tablica.', array:[]}, {status:401}) 
			} 
		}
		else NextResponse.json({message:'Ne postoji tablica s tim imenom', array:[]}, {status:404})
	} catch(error) {
		console.error(error)
		return NextResponse.json({message:'Dogodila se greska.'}, {status:500})
	}
}