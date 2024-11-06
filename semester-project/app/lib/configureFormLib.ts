import * as z from 'zod'
import { checkFileTypes } from './renderFormLib'

export const inputTypes:{type:string, toDisplay:string, dbType:string}[]=[
	{type: 'pin', toDisplay: 'OIB', dbType: 'text'},
	{type:'text', toDisplay: 'Tekst', dbType: 'text'},
	{type: 'int', toDisplay: 'Cijeli broj', dbType: 'int'},
	{type: 'float', toDisplay: 'Decimalni broj', dbType: 'double'},
	{type: 'file', toDisplay: 'Datoteka', dbType: 'text[]'},
	{type: 'date', toDisplay: 'Datum', dbType: 'date'},
	{type:'radio', toDisplay: 'Više ponuđenih mogućnosti | JEDAN MOGUĆI ODGOVOR', dbType: 'text'},
	{type:'checkbox', toDisplay: 'Više ponuđenih mogućnosti | VIŠE MOGUĆIH ODGOVORA', dbType: 'text[]'},
]

export const fileTypes:{name:string, extension:string, type:string}[]=[
	{name: 'JPG slika', extension: 'jpg', type: 'image/jpeg'},
	{name: 'PNG slika', extension: 'png', type: 'image/png'},
	{name: 'WORD dokument (.doc)', extension:'doc', type: 'application/msword'},
	{name: 'WORD dokument (.docx)', extension:'docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
	{name: 'PDF dokument', extension:'pdf', type: 'application/pdf'},
	{name: 'ZIP arhiv', extension: 'zip', type: 'application/x-zip-compressed'},
	{name: '7z arhiv', extension: '7z', type: ''}
]

/*xslx application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
xslx application/vnd.ms-excel*/

export async function getDepartments({tableName}: {tableName:string}) : Promise<{id:number, name:string}[]> {
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

async function titleAvalible({title, sketch}: {title:string, sketch: boolean}) : Promise<boolean | undefined> {
	let prefix:string=''
	if(!(typeof window === undefined)) prefix = process?.env?.NEXTAUTH_URL || ''
	const response = await fetch(prefix+'/api/check-title', {
		method:'POST',
		headers: {'content-type': 'applicaion/json'},
		body: JSON.stringify({title:title, sketch:sketch})
	})
	const {message, exists} = await response.json()
	return !exists
}

export async function validateDepartment(id:number, tableName:string) : Promise<boolean> {
	const departments = await getDepartments({tableName:tableName})
	if(departments.some((department)=>department.id===id)) return true
	else return false
}

interface validateFileTypesProps {inputType:string, fileTypes:string[]}

export function validateFileTypes(props:validateFileTypesProps):boolean {
	if(props.inputType==='file' && props.fileTypes.length===0) return false
	return true
}

export function validateUniquenessOfFields(fields:Field[]) : boolean {
	let returnValue=true
	fields.map((item)=>{
		if(fields.filter((field)=>field.label===item.label).length>1) {returnValue=false; return}
	})
	return returnValue
}

export function validateUniquenessOfOptions(inputType:string, options:Option[]) : boolean {
	let returnValue=true
	if(inputType==='radio' || inputType==='checkbox')
		options.map((item)=>{
			if(options.filter((option)=>option.option===item.option).length>1) {returnValue=false; return}
		})
	return returnValue
}

export function validateOptions(inputType:string, options:Option[]) : boolean {
	if((inputType==='radio' || inputType==='checkbox') && options.length===0) return false
	return true
}

export function validateFileCount(inputType:string, multiple: string | null) : boolean {
	if(inputType==='file' && !['true', 'false'].includes(multiple || '')) return false
	return true
}

interface checkDependenciesInput {conditional: boolean, dependencies:Dependency[]}

export function validateDependencies({conditional, dependencies}: checkDependenciesInput) : boolean {
	if(conditional && !dependencies.length) return false
	return true
}

export function validateDependencies2({conditional, dependencies}: checkDependenciesInput) : boolean {
	let returnValue=true
	if(conditional && dependencies.length) {
		dependencies.map((dependency,index)=>{
			if(dependencies.filter((item)=>item.label===dependency.label).length>1) {returnValue=false; return}
		})
	}
	return returnValue
}

export function validateDependencies3({conditional, dependencies}: checkDependenciesInput) : boolean {
	let returnValue=true
	if(conditional && dependencies.length)
		dependencies.map((dependency)=>{
			dependency.values.map((value)=>{
				if(dependency.values.filter((item)=>item===value).length>1) {returnValue=false; return}
			})
		})
	return returnValue
}

export function validateDependencyValues({label, values} : {label:string, values:string[]}) : boolean {
	if(label && !values.length) return false
	return true
}

export function validateFileTypes2(props: validateFileTypesProps):boolean {
	if(props.inputType==='file') {
		return props.fileTypes.every((fileType)=>fileTypes.map(({type})=>type).includes(fileType))
		/*if(props.fileTypes.some((fileType)=>!fileTypes.map(({type})=>type).includes(fileType))) return false
		else return true*/
	}
	else return true
}

export function isTimeSet(shouldBe:boolean | undefined | null, time:string) : boolean {
	let returnValue=true
	if(shouldBe)
		if(!time) returnValue = false
	return returnValue
}

function timeCompare(d1:Date, d2:Date) : boolean {
	if (d1.getTime()<=d2.getTime()) return false
	else return true
}

function checkBoundaries(isSet:boolean | undefined | null, d1:Date ) : boolean {
	if(isSet) {
		if(d1.getTime()<=Date.now()) return false
		else return true
	}
	else return true
}

function checkBoundaries2(isSet1:boolean | undefined | null, d1:Date, isSet2:boolean | undefined | null, d2:Date ) : boolean {
	if(isSet1!=undefined && isSet2!=undefined) {
		if(isSet1 && isSet2) {
			if(d1.getTime()>=d2.getTime()) return false
			else return true
		}
		else return true
	}
	else return true
}

function checkRateLimit({rate_limit_set, rate_limit}:{rate_limit_set:string[], rate_limit:string}) : boolean {
	if(rate_limit_set[0]!='true') return true
	else
		if(isNaN(Number.parseInt(rate_limit))) return false
		else return true
}

function checkRateLimit2(rate_limit:string) : boolean {
	if (!rate_limit) return true
	else {
		const limit = Number.parseInt(rate_limit)
		if(limit>0) return true
		else return false
	}
}

function trueFalseCheck(value: string) : boolean {
	return ['true', undefined, '', 'false'].includes(value)
}

function strToBool(str: string) : boolean {
	return str==='true' ? true : false
}

export const optionSchema = z.object({
	option: z.string().min(1, 'Unesite mogući odabir.')
})

export const dependencySchema = z.object({
	label:z.string().min(1, 'Odaberite polje.'),
	values:z.array(z.string())
})
.refine((data)=>validateDependencyValues({...data}), {path: ['values'], message:'Odaberite vrijednosti.'})

export const render = z.object({
	conditional: z.boolean(),
	//when: z.string().min(1, 'Odaberite kad će se polje prikazivati').refine((value)=>['always', 'conditional'].includes(value), 'Podatak nije označen na pravi način.'),
	statisfyAll: z.boolean() /*string().refine((value)=>!value || ['all', 'any'].includes(value), 'Podatak nije označen na pravi način.')*/,
	dependencies:z.array(dependencySchema)
})
.refine((data)=>validateDependencies({conditional: data.conditional, dependencies: data.dependencies}), {path:['dependencies'], message: 'Potrebno je odrediti u kojim će se slučajevima polje prikazivati.'})
.refine((data)=>validateDependencies2({conditional: data.conditional, dependencies: data.dependencies}), {path:['dependencies'], message: 'Nije moguće više više puta odabrati isto polje.'})
.refine((data)=>validateDependencies3({conditional: data.conditional, dependencies: data.dependencies}), {path:['dependencies'], message: 'Nije moguće više više puta odabrati istu vrojednost nekog polja.'})
//.refine((data)=>data.conditional || data.statisfyAll!==undefined, {path:['statisfyAll'], message: 'Odredite koliko uvjeta mora biti zadovoljeno'})

export const required = z.object({
	isRequired: z.string().min(1, 'Odredite je li polje obavezno').refine((value)=>['yes', 'no', 'conditional'].includes(value), 'Podatak nije označen na pravi način.'),
	statisfyAll: z.boolean() /*string().refine((value)=>!value || ['all', 'any'].includes(value), 'Podatak nije označen na pravi način.')*/,
	dependencies:z.array(dependencySchema)
})
//.refine((data)=>validateDependencies({conditional: data.isRequired==='conditional', dependencies: data.dependencies}), {path:['dependencies'], message: 'Potrebno je odrediti u kojim će slučajevima polje biti obavezno.'})
.refine((data)=>validateDependencies2({conditional: data.isRequired==='conditional', dependencies: data.dependencies}), {path:['dependencies'], message: 'Nije moguće više više puta odabrati isto polje.'})
.refine((data)=>validateDependencies3({conditional: data.isRequired==='conditional', dependencies: data.dependencies}), {path:['dependencies'], message: 'Nije moguće više više puta odabrati istu vrijednost nekog polja.'})
//.refine((data)=>data.isRequired!=='conditional' || data.statisfyAll, {path:['statisfyAll'], message: 'Odredite koliko uvjeta mora biti zadovoljeno'})

export const fieldSchema = z.object({
	label:z.string().min(1, 'Potrebno je unijeti naziv polja.'),
	inputType: z.string().min(1, 'Odaberite vrstu unosa za ovo polje.'),
	multiple: z.boolean().optional(),
	fileTypes: z.array(z.string()),
	required: required,
	requireIfRendered: z.boolean().optional(),
	//renderIfRequired: z.string().refine((value)=>!value[0] || trueFalseCheck(value), 'Podatak nije označen na pravi način.'),
	render: render,
	options: z.array(optionSchema),
})
//.refine(({requireIfRendered})=>!(requireIfRendered===undefined), {path: ['requireIfRendered'], message: 'Unesite odabir'})
.refine((data)=>validateFileTypes(data), {path: ['fileTypes'], message: 'Unesite dozvoljene tipove datoteka.'})
.refine((data)=>validateFileTypes2(data), {path: ['fileTypes'], message: 'Naveden je nedopušteni tip datoteke.'})
.refine((data)=>validateOptions(data.inputType, data.options), {path:['options'], message:'Unesite moguće odabire.'})
.refine((data)=>validateUniquenessOfOptions(data.inputType, data.options), {path: ['options'], message: 'Svi ponuđeni odabiri unutar jednog polja moraju biti jedinstveni.'})
.refine(({inputType, multiple})=>inputType === 'file' ? (multiple !== undefined && multiple !== null) : true, {path: ['multiple'], message:'Unesite koliko je datoteka moguće priložiti.'})
.refine((data): boolean=>{
	if(data.required.isRequired==='conditional') {
		if(!data.requireIfRendered) {
			if(data.required.dependencies.length) return true
			else return false
		}
		else return true
	}
	else return true
}, {path: ['required.dependencies'], message: 'Odredite u kojim će slučajevima polje biti obavezno'})
.refine(({requireIfRendered, render, required})=>(required.isRequired!=='conditional' || (requireIfRendered ? render : required).dependencies.length<=1) || (required.isRequired==='conditional' && typeof(required.statisfyAll)==='boolean'), {path: ['required.statisfyAll'], message: 'Odredite koliko uvjeta mora biti zadovoljeno'})
.refine(({render})=>(!render.conditional || render.dependencies.length<=1) || render.conditional && typeof(render.statisfyAll)==='boolean', {path: ['render.statisfyAll'], message: 'Odredite koliko uvjeta mora biti zadovoljeno'})
//.refine((data)=>!(data.renderIfRequired || data.requireIfRendered) || (data.renderIfRequired!==data.requireIfRendered), {path:['useRenderAsRequired', 'useRequiredAsRender'], message: 'Ove vrijednosti ne smiju imati istu vrijednost'})

export const formSchema = z.object({
	department_id: z.number().refine((value)=>value, 'Odaberite nadležni odjel.').refine((value)=>validateDepartment(value, 'department'), 'Unesen je nepostojeći odjel.'),
	title:z.string().min(1, "Potrebno je unijeti naslov obrasca."),
	category_id: z.number().refine((value)=>value, 'Potrebno je odabrati kategoriju prijavnog obrasca.').refine((value)=>validateDepartment((value),'category'),'Ne postoji odabrana kategorija!'),
	start_time_limited: z.boolean()/*z.string().min(1, 'Unesite odabir').refine((value)=>trueFalseCheck(value), 'Podatak nije označen na pravi način.')*/,
	end_time_limited:  z.boolean(),
	avalible_from:z.date({invalid_type_error: 'Ovo polje prima samo datume.'}).nullish(),
	avalible_until:z.date({invalid_type_error: 'Ovo polje prima samo datume.'}).nullish(),
	rate_limit_set: z.boolean()/*z.string().refine((value)=>trueFalseCheck(value), 'Podatak nije označen na pravi način.')*/,
	rate_limit : z.number({invalid_type_error: 'Ograničenje broja ispunjavanja po korisniku smije biti samo broj'}).positive('Ograničenje broja ispunjavanja po korisniku mora biti pozitivno').optional().nullish(),
	fields: z.array(fieldSchema).refine((value)=>validateUniquenessOfFields(value), 'Nazivi polja moraju biti jedinstveni.'),
	sketch: z.boolean(),
	thumbnail_setting: z.string().min(1, 'Unesite odabir').refine((value)=>['default', 'existing', 'new'].includes(value), 'Polje ima nedopuštenu vrijednost. Dopuštene vrijednosti su: ' + ['default', 'existing', 'new'].join(' ') + '.'),
	thumbnail_id: z.number().nullish(),
	thumbnail: z.any().optional().refine((file)=>!file || file instanceof File , 'Ovo polje prima samo datoteke').refine((file)=>!file || ['jpg', 'png', 'jpeg'].includes(file?.name.split('.').slice(-1)[0]), 'Ovo polje prima samo slike')
})
.refine(({start_time_limited})=>!(start_time_limited === undefined || start_time_limited === null), {path: ['start_time_limited'], message: 'Unesite odabir'})
.refine(({end_time_limited})=>!(end_time_limited === undefined || end_time_limited === null), {path: ['end_time_limited'], message: 'Unesite odabir'})
.refine((data)=>{
	if(data.start_time_limited) {
		if(data.avalible_from) return true
		else return false
	}
	else return true
}, {path: ['avalible_from'], message: 'Odredite kada će obrazac postati dostupan.'})
.refine((data)=>{
	if(data.end_time_limited) {
		if(data.avalible_until) return true
		else return false
	}
	else return true
}, {path: ['avalible_until'], message: 'Odredite do kada će obrazac biti dostupan.'})
//.refine((data)=>checkBoundaries(data.start_time_limited, new Date(data.avalible_from)), {path: ['startTime'], message: 'Obrazac ne može postati dostupan prije objave.'})
//.refine((data)=>checkBoundaries(data.end_time_limited, new Date(data.avalible_until)), {path: ['endTime'], message: 'Obrazac ne može postati biti dostupan prije objave.'})
.refine((data)=>{
	if(data.avalible_from && data.avalible_until) return data.avalible_from.getTime() < data.avalible_until.getTime()
	else return true
}, {path:['avalible_from'], message:'Obrazac ne može prestati biti dostupan prije početka dostupnosti.'})
.refine((data)=>{
	if(data.avalible_from && data.avalible_until) return data.avalible_from.getTime() < data.avalible_until.getTime()
	else return true
}, {path:['avalible_until'], message:'Obrazac ne može prestati biti dostupan prije početka dostupnosti.'})
.refine((data)=>data.rate_limit_set!==true || data.rate_limit, {path: ['rate_limit'], message: 'Unesite koliko puta će biti moguće ispuniti obrazac'})
.refine(({fields, sketch})=>sketch || fields.length>=1,{path: ['fields'], message: 'Obrazac mora sadržavati barem jedno polje.'})
.refine(({fields}) : boolean =>{
	const allFields = fields.map(({label})=>label)
	return fields.every((field, index) : boolean => {
		if(field.render.dependencies.length) {
			if(field.render.dependencies.map(({label})=>label).every((name)=>allFields.indexOf(name)<index)) return true
			else return false
		}
		else if(field.required.dependencies.length) {	
			if(field.required.dependencies.map(({label})=>label).every((name)=>allFields.indexOf(name)<index)) return true
			else return false
		}
		else return true
	})
}, {path: ['fields'], message: 'Iscrtavanje ili obvezost nekog polja ne smije ovisiti o polju iza njega. Provjerite redoslijed polja i promijenite ga.'})
.refine(({thumbnail_setting, thumbnail_id})=>{
	if(thumbnail_setting==='existing') {
		if(thumbnail_id) return true
		else return false
	}
	else return true
}, {path: ['thumbnail_id'], message: 'Odaberite naslovnu sliku'})
.refine(({thumbnail_setting, thumbnail})=>{
	if(thumbnail_setting==='new') {
		if(thumbnail) return true
		else return false
	}
	else return true
}, {path: ['thumbnail'], message: 'Odaberite naslovnu sliku'})

export type Dependency = z.infer<typeof dependencySchema>
export type Field = z.infer<typeof fieldSchema>
export type Option = z.infer<typeof optionSchema>
export type Form = z.infer<typeof formSchema>
export type RequirementSettings = z.infer<typeof required>
export type RenderSetings = z.infer<typeof render>

export const optionDeleteWarning = 'Da biste uklonili ili mijenjali ovaj odabir, uklonite kvačice ispred istog kod određivanja ovisnosti.'
export const fieldDeleteWarning = 'Da biste uklonili ili mijenjali ovo polje, prethodno uklonite ovisnosti povezane s njime.'

export const emptyForm : Form = {title: '', category_id: 0, department_id: 0, start_time_limited: false, avalible_from: null, end_time_limited: false, avalible_until: null, rate_limit:undefined, fields: [], rate_limit_set: true, sketch: false, thumbnail_setting: 'default', thumbnail_id:0, thumbnail: undefined}
export const RequirementConfig : RequirementSettings = {isRequired: '', statisfyAll: false, dependencies: []}
export const RenderConfig : RenderSetings = {statisfyAll: false, dependencies: [], conditional: false}
export const emptyField = {label:'', inputType:'', fileTypes:[], required:RequirementConfig, render:RenderConfig,  options:[], /*renderIfRequired:'', requireIfRendered: ''*/}
export const emptyDependency : Dependency = {label:'', values:[]}

export function canFieldBeDeleted(fields:Field[], targetedFieldIndex:number) : boolean {
	const targetedField = fields[targetedFieldIndex]
	let returnValue = true
	fields.map(({required, render})=>{
		if(required.dependencies.some((value)=>value.label===targetedField.label)) {returnValue = false; return}
		else if(render.dependencies.some((value)=>value.label===targetedField.label)) {returnValue = false; return}
	})	
	return returnValue
}

export function changesExist(initial: Form, modified: Form) : boolean {
	return !(Object.entries(initial).every(([key, value])=> JSON.stringify(value)===JSON.stringify(modified[key as keyof typeof modified])))
}

export function FieldsEqual(first: Field, second: Field) : boolean {
	return Object.entries(first).every(([key, value])=> JSON.stringify(value)===JSON.stringify(second[key as keyof typeof second]))
}