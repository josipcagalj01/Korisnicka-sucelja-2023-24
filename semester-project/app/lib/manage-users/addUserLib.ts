import * as z from 'zod'
import { validateDepartment } from '../configureFormLib'

export async function getAll({tableName}: {tableName:string}) : Promise<{id:number, name:string}[]> {
	let prefix:string=''
	if(!(typeof window === undefined)) prefix = process?.env?.NEXTAUTH_URL || ''
	try {
		const response = await fetch(prefix+'/api/get-all', {
			method:'POST',
			headers: {'content-type': 'applicaion/json'},
			body: JSON.stringify({tableName:tableName})
		})
		const {message, array}:{message:string, array:{id:number, name:string}[]} = await response.json()
		return array
	} catch(error) {
		console.error(error)
		return []
	}
}

export async function checkRole(role_id: number) : Promise<boolean> {
	const roles = await getAll({tableName: 'role'})
	return roles.map(({id})=>id).includes(role_id)
}

export const formSchema = z.object({
	pin: z.string().min(1, 'Potrebno je unijeti OIB').regex(/^\d+$/, 'OIB mora sadržavati samo znamenke').min(11, 'OIB sadrži točno 11 znamenaka!').max(12, 'OIB sadrži točno 11 znamenaka!'),
	name: z.string().min(1, 'Potrebno je upisati ime').max(100),
	surname: z.string().min(1, 'Potrebno je upisati prezime').max(100),
	birth_date: z.string().min(1, 'Potrebno je unijeti datum rođenja'),
	street: z.string().min(1, 'Potrebno je upisati ulicu').max(100),
	house_number: z.string().min(1, 'Potrebno je upisati kućni broj').regex(/^\d+[A-Za-z]?$/, 'Unesen je neispravan oblik kućnog broja').max(100),
	place: z.string().min(1, 'Potrebno je upisati mjesto prebivališta').max(100),
	town: z.string().min(1, 'Potrebno je upisati naziv općine/grada').max(100),
	username: z.string().min(1, 'Potrebno je upisati korisničko ime').max(100),
	email: z.string().min(1, 'Potrebno je upisati adresu e-pošte').email('Neispravno upisana adresa-e pošte'),
	role_id: z.number().refine(async (value)=>await checkRole(value), 'Unijeli ste neposojeću kategoriju korisnika'),
	department_id: z.number({required_error: 'Odaberite nadležni odjel.'}).nullish().refine((value)=>!value || validateDepartment(value, 'department'), 'Unesen je nepostojeći odjel.'),
	password: z.string().min(1, 'Potrebno je unijeti lozinku').min(7, 'Lozinka mora imati barem 8 znakova'),
	confirmPassword: z.string().min(1, 'Potrebno je ponovno unijeti lozinku')
})
.refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Lozinka nije točna' })
.refine(({role_id, department_id})=>{
	if(role_id===1) {
		return !department_id ? true : false
	}
	else return true
}, {path: ['department_id'], message: 'Samo zaposlenici mogu biti raspoređeni u neki od upravnih odjela.'})
.refine(({role_id, department_id})=>{
	if(role_id!==2) {
		return department_id ? true : false
	}
	else return true
}, {path: ['department_id'], message: 'Zaposlenici moraju biti raspoređeni u neki od upravnih odjela.'})

export type AddUserForm = z.infer<typeof formSchema>

export const emptyForm = { pin: '', name: '', surname: '', birth_date: '', street: '', house_number:'', place: '', town: '', username: '', email: '', password: '', confirmPassword: '' }