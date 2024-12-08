import * as z from 'zod'
import { validateDepartment, fileTypes } from '../configureFormLib'

export const formSchema = z.object({
	title: z.string().min(1, 'Unesite naslov obavijesti'),
	category_id: z.number().refine((value)=>value, 'Potrebno je odrediti kategoriju obavijesti.').refine((value)=>validateDepartment(value, 'announcment_category'), 'Unesena je nepostojeća kategorija.'),
	department_id: z.number().refine((value)=>value, 'Potrebno je odabrati odjel nadležan za ovu objavu.').refine((value)=>validateDepartment(value, 'department'), 'Unesen je nepostojeći odjel.'),
	thumbnail_setting: z.string().min(1, 'Unesite odabir'),
	thumbnail_id: z.number().nullish().optional(),
	thumbnail: z.any().optional().refine((file)=>!file || file instanceof File , 'Ovo polje prima samo datoteke').refine((file)=>!file || fileTypes.map(({type})=>type).includes(file?.type), 'Dopušteni tipovi privitaka su: ' + fileTypes.map(({extension})=>extension).join(' ')),
	attach_form: z.boolean().optional().nullish(),
	form_id: z.number().optional().nullish(),
	sketch: z.boolean({required_error: 'Odredite hoće li obavijest biti dostupna'}),
	attachments: z.array(z.any()).optional(),
	existing_attachments: z.array(z.number().min(1, 'Oznaka privitka mora biti prirodni broj.'), {invalid_type_error: 'Ovo polje smije sadržavati samo brojeve.'}),
	content: z.any()
})
.refine(({attach_form, category_id})=>{
	if(category_id!==4) return !(attach_form===null && attach_form===undefined)
	else return true
	}, {path: ['attach_form'], message: 'Unesite odabir!'})
.refine(({form_id, attach_form})=>{
	if(attach_form) {
		if(!form_id || isNaN(form_id)) return false
		else return true
	}
	else return true
}, {path: ['form_id'], message: 'Potrebno je odabrati obrazac poveznica na koji će se prikazati uz ovu obavijest'})
.refine(({thumbnail, thumbnail_setting})=>{
	if(thumbnail_setting==='new' && typeof window !== 'undefined') {
		if(!thumbnail) return false
		else return true
	}
	else return true
}, {path: ['thumbnail'], message: 'Potrebno je priložiti naslovnu sliku'})
.refine(({thumbnail_id, thumbnail_setting})=>{
	if(thumbnail_setting==='existing') {
		if(!thumbnail_id || isNaN(thumbnail_id)) return false
		else return true
	}
	else return true
}, {path: ['thumbnail_id'], message: 'Potrebno odabrati naslovnu sliku obavijesti'})

export type Form = z.infer<typeof formSchema>
export const defaultValues = {title: '', department_id: 0, category_id: 0, thumbnail_setting: 'default', thumbnail_id: null,attach_form: false, form_id: null, sketch: false, attachments: [], existing_attachments: []}

export function changesExist(initial: Form, modified: Form) : boolean {
	return !(Object.entries(initial).every(([key, value])=> JSON.stringify(value)===JSON.stringify(modified[key as keyof typeof modified])))
}