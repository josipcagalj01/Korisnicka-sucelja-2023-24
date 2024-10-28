import * as z from 'zod'
import {checkRole} from './addUserLib'
import { validateDepartment } from '../configureFormLib' 

export const formSchema = z.object({
	name: z.string().min(1, 'Potrebno je upisati ime korisnika').max(100),
	surname: z.string().min(1, 'Potrebno je upisati prezimeime korisnika').max(100),
	username: z.string().min(1, 'Potrebno je upisati korisničko ime').max(100),
	role_id: z.number().refine(async (value)=>await checkRole(value), 'Unijeli ste neposojeću kategoriju korisnika'),
	department_id: z.number({required_error: 'Odaberite nadležni odjel.'}).nullish().refine((value)=>!value || validateDepartment(value, 'department'), 'Unesen je nepostojeći odjel.'),
	street: z.string().min(1, 'Potrebno je upisati ulicu').max(100),
	house_number: z.string().min(1, 'Potrebno je upisati kućni broj').regex(/^\d+[A-Za-z]?$/, 'Unesen je neispravan oblik kućnog broja').max(100),
	place: z.string().min(1, 'Potrebno je upisati mjesto prebivališta').max(100),
	town: z.string().min(1, 'Potrebno je upisati naziv općine/grada').max(100),
	email: z.string().min(1, 'Potrebno je upisati adresu e-pošte').email('Neispravno upisana adresa-e pošte'),
	password: z.string().refine((value)=>!value || value.length>=8, 'Lozinka mora imati barem 8 znakova'),
})
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

export type UpdateUserForm = z.infer<typeof formSchema>

export function changesExist(original: UpdateUserForm, modified: UpdateUserForm) : boolean {
	return !Object.entries(original).every(([key, value])=>modified[key as keyof typeof modified]===value)
}