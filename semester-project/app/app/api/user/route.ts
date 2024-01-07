import {db} from '../../../lib/db'
import { NextResponse } from 'next/server'
import {hash} from 'bcrypt'
import * as z from 'zod'

const userSchema = z.object({
    pin: z.string().min(1,'Potrebno je unijeti OIB').min(10, 'OIB sadrži točno 11 znamenaka!').regex(/^\d+$/, 'OIB mora sadržavati samo znamenke').max(11, 'OIB sadrži točno 11 znamenaka!'),
    name: z.string().min(1, 'Potrebno upisati ime').max(100),
    surname: z.string().min(1, 'Potrebno je upisati prezime').max(100),
    address: z.string().min(1, 'Potrebno je upisati adresu prebivališta').max(100),
    username: z.string().min(1, 'Potrebno je upisati korisnicko ime').max(100),
    email: z.string().min(1, 'Potrebno je upisati adresu e pošte').email('Neispravno upisana adresa e pošte'),
    password: z.string().min(1,'Potrebno je unijeti lozinku').min(7, 'Lozinka mora imati barem 8 znakova')
})

export async function  POST(req: Request) {
    try {
        
        const body = await req.json()
        const { pin, name, surname, address, email, username, password} = userSchema.parse(body);
        
        const isEmailUnique = await db.user.findUnique( {where: {email: email}})
        if(isEmailUnique) {
            return NextResponse.json({user: null, message: 'Već postoji korisnik s tom adresom e-pošte!'},{status: 409})
        }

        const isUsernameUnique = await db.user.findUnique( {where: {username: username}})
        if(isUsernameUnique) {
            return NextResponse.json({user: null, message: 'Već postoji korisnik s tim korisničkim imenom!'},{status: 409})
        }

        const isPinUnique = await db.user.findUnique( {where: {pin: pin}})
        if(isPinUnique) {
            return NextResponse.json({user: null, message: 'Već postoji korisnik s tim OIB-om!'},{status: 409})
        }
        
        const category = 1;
        const hashedPassword = await hash(password, 10)
        
        const newUser = await db.user.create({ data: {name, surname, address, pin, category, username, email, password:hashedPassword}})
        
        const {password: newUserPassword, ...rest} = newUser
        return Response.json({user: rest, message: 'Novi korisnički račun uspješno stvoren!'}, {status: 201})
    }catch(error) {
        return NextResponse.json( {message: "Dogodila se greška!"}, {status: 500})
    }
    
}