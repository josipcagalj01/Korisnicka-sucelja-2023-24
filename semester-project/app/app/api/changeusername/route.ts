import {db} from '../../../lib/db'
import { NextResponse } from 'next/server'
import {compare} from 'bcrypt'
import * as z from 'zod'

const userSchema = z.object({
    id:z.number(),
    username: z.string().min(1, 'Potrebno je upisati željeno korisničko ime.'),
	password: z.string().min(1, 'Potrebno je unijeti lozinku')
})

export async function  POST(req: Request) {
    try {
        
        const body = await req.json()
        const {id, username, password} = userSchema.parse(body);
        
        const user = await db.user.findUnique( {where: {id: id}})
        if(!user) {
            return NextResponse.json({user: null, message: 'Ne postoji korisnički račun čije se korisničko ime pokušava promijeniti'},{status: 404})
        }

        const userWithDesiredId = await db.user.findUnique( {where: {username: username}})
        if(userWithDesiredId) {
            const {password: newUserPassword, ...rest} = user
            if(user.id===userWithDesiredId.id) return NextResponse.json({user: rest, message: 'Uneseno korisničko ime se ne razlikuje od prethodnog.'},{status: 201})
            else return NextResponse.json({user: rest, message: 'Već postoji korisnik s tim korisničkim imenom.'},{status: 409})
        }

        const passwordMatch = await compare(password, user.password)
        if(!passwordMatch) return NextResponse.json({message: 'Unesena lozinka nije ispravna'}, {status: 401})
        
        const updatedUser = await db.user.update({ where :{id: id}, data: {username:username}})
        
        const {password: newUserPassword, ...rest} = updatedUser
        return Response.json({user: rest, message: 'Korisničko ime uspješno promijenjeno'}, {status: 201})
    }catch(error) {
        return NextResponse.json( {message: "Dogodila se greška!"}, {status: 500})
    }
}