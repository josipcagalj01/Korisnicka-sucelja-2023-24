import {db} from '../../../lib/db'
import { NextResponse } from 'next/server'
import {hash, genSalt} from 'bcrypt'
import * as z from 'zod'

const userSchema = z.object({
    pin: z.string().min(1,'Potrebno je unijeti OIB').min(10, 'OIB sadrži točno 11 znamenaka!').regex(/^\d+$/, 'OIB mora sadržavati samo znamenke').max(11, 'OIB sadrži točno 11 znamenaka!'),
    name: z.string().min(1, 'Potrebno upisati ime').max(100),
    surname: z.string().min(1, 'Potrebno je upisati prezime').max(100),
    birth_date: z.string().min(1, 'Potrebno je unijeti datum rođenja'),
    street: z.string().min(1, 'Potrebno je upisati ulicu').max(100),
	house_number: z.string().min(1, 'Potrebno je upisati kućni broj').regex(/^\d+[A-Z]?$/, 'Unesen je neispravan oblik kućnog broja').max(100),
	place: z.string().min(1, 'Potrebno je upisati mjesto prebivališta').max(100),
	town: z.string().min(1, 'Potrebno je upisati naziv općine/grada').max(100),
    username: z.string().min(1, 'Potrebno je upisati korisnicko ime').max(100),
    email: z.string().min(1, 'Potrebno je upisati adresu e pošte').email('Neispravno upisana adresa e pošte'),
    password: z.string().min(1,'Potrebno je unijeti lozinku').min(7, 'Lozinka mora imati barem 8 znakova')
})

export async function  POST(req: Request) {
    try {
        
        const body = await req.json()
        const {password, birth_date, ...rest1} = userSchema.parse(body);
        
        const isEmailUnique = await db.user.findUnique( {where: {email: rest1.email}})
        if(isEmailUnique) {
            return NextResponse.json({user: null, message: 'Već postoji korisnik s tom adresom e-pošte!'},{status: 409})
        }
        
        const isUsernameUnique = await db.user.findUnique( {where: {username: rest1.username}})
        if(isUsernameUnique) {
            return NextResponse.json({user: null, message: 'Već postoji korisnik s tim korisničkim imenom!'},{status: 409})
        }

        const isPinUnique = await db.user.findUnique( {where: {pin: rest1.pin}})
        if(isPinUnique) {
            return NextResponse.json({user: null, message: 'Već postoji korisnik s tim OIB-om!'},{status: 409})
        }
        
        const salt = await genSalt(10)
        
        const hashedPassword = await hash(password, salt)
        
        const newUser = await db.user.create({ data: {birth_date: new Date(birth_date), role: {connect: {id: 1}}, password:hashedPassword, ...rest1}})
        const {password: newUserPassword, ...rest2} = newUser
        return Response.json({user: rest2, message: 'Novi korisnički račun uspješno stvoren!'}, {status: 201})
    }catch(error) {
        console.log(error)
        return NextResponse.json( {message: "Dogodila se greška!"}, {status: 500})
    }   
}