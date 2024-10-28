import {db} from '../../../lib/db'
import { NextResponse } from 'next/server'
import {hash, genSalt} from 'bcrypt'
import { formSchema } from '../../../lib/manage-users/addUserLib'
import { getSession } from '../../../lib/getSession'

export async function  POST(req: Request) {
    try {
        
        const body = await req.json()
        const {password, birth_date, role_id, department_id, confirmPassword, ...rest1} = await formSchema.parseAsync(body);

        const {user} = await getSession() || {user:null}
        if(department_id && user?.role_id!==1) return NextResponse.json({user: null, message: 'Samo administrtor smije dodavati zaposlenike.'},{status: 401})
        
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
        
        const newUser = await db.user.create({ data: {birth_date: new Date(birth_date), role: {connect: {id: role_id}}, department: department_id ? {connect: {id: department_id}} : undefined, password:hashedPassword, ...rest1}})
        const {password: newUserPassword, ...rest2} = newUser
        return Response.json({user: rest2, message: 'Novi korisnički račun uspješno stvoren!'}, {status: 201})
    } catch(error) {
        console.log(error)
        return NextResponse.json( {message: "Dogodila se greška!"}, {status: 500})
    }   
}