import { Field } from "./configureFormLib"
import * as z from 'zod'

export function isFile(value:any) : boolean {
	if(value instanceof File) return true
	else return false
}

export function onlyFiles(files: any[]) : boolean {
	if(files.some((value)=>!(value instanceof File))) return false
	return true
}

export function filesOnly(label: string) : string {
	return `Polje ${label} smije sadrzavati samo datoteke.`
}

export function isDate(input:string) : boolean {
	if(isNaN(new Date(input).getTime())) return false
	else return true
}

export function checkFileTypes(files:any[], fileTypes: string[]) : boolean {
	if(files.some((file)=>!fileTypes.includes(file.name.split('.').slice(-1)[0]))) return false
	else return true
}

export const invalidFileTypeMessage = 'Sve priložene datoteke moraju biti dozvoljenih tipova.'

export function missingFileMessage(label:string) : string {
	return `Potrebno je priložiti ${label}.`
}

export function missingValueMessage(label:string) : string {
	return `Potrebno je unijeti ${label}.`
}

export function isSet(value: string | any[] | number) : boolean {
	if(typeof value === 'string') {
		if(value!='') return true
		else return false
	}
	else if(Array.isArray(value)) {
		if(value.length) return true
		else return false
	}
	else if(typeof value === 'number') {
		if(Number.isNaN(value)) return false
		else return true
	}
	else return false
}

function checkConditionalRequirement(formCollectedData:any, dependency: {label:string, values:string[]}, statisfyAll:boolean, requirementsCount:number, key: string, fields:Field[]) : boolean {
	let returnValue : boolean = true
	let statisfied:number = 0
	const labelledFieldIndex = fields.map(({label})=>label).indexOf(dependency.label)
	if(Array.isArray(formCollectedData[`a${labelledFieldIndex}`])) {
		if(formCollectedData[`a${labelledFieldIndex}`].some((collectedValue:any)=>dependency.values.includes(collectedValue))) {
			if(isSet(formCollectedData[key])) {
				if(statisfyAll) ++statisfied
				else returnValue = true
			}
			else returnValue = false
		}
		else returnValue = true
	}
	else {
		if(dependency.values.includes(formCollectedData[`a${labelledFieldIndex}`])) {
			if(isSet(formCollectedData[key])) {
				if(statisfyAll) ++statisfied 
				else returnValue = true
			}
			else returnValue = false
		}
		else returnValue = true
	}
	return statisfyAll ? statisfied===requirementsCount : returnValue
}
const re = new RegExp(/^\d+$/)

export function generateZodSchema(fields: Field[], side:string) : {schema: z.ZodObject<any>, emptyForm: any} {
	const clientRendering = side === 'client' ? true : false
	let emptyForm : any = {}
	let schema = z.object({})

	fields.map(({label, inputType, fileTypes, ...rest}, index)=>{
		const key = `a${index}`
		const multiple = rest.multiple === 'true' ? true : false
		const required = rest.required.isRequired === 'yes' ? true : false

		if(inputType==='checkbox') {
			if(required) schema=schema.extend({[key] : z.array(z.string()).min(1, missingValueMessage(label))})
			else schema=schema.extend({[key] : z.array(z.string())})
			if(clientRendering) emptyForm[key]=[]
		}
		else if(inputType==='radio') {
			if(required) schema = schema.extend({[key]: z.string().min(1, missingValueMessage(label)) })
			else schema = schema.extend({[key]: z.string()})
			if(clientRendering) emptyForm[key]=''
		}
		else if(inputType==='pin') {
			if(required) schema = schema.extend({[key]: z.string().min(1, missingValueMessage(label)).regex(/^\d+$/, 'OIB mora sadržavati samo znamenke').min(11, 'OIB sadrži točno 11 znamenaka!').max(11, 'OIB sadrži točno 11 znamenaka!')})
			else schema = schema.extend({[key]: z.string().refine((pin)=>!pin || re.test(pin), 'OIB mora sadržavati samo znamenke').refine((pin)=>!pin || pin.length===11, 'OIB sadrži točno 11 znamenaka!')})
			if(clientRendering) emptyForm[key]=''
		}
		else if(inputType === 'int') {
			if(required) schema = schema.extend({[key]: z.string().min(1, missingValueMessage(label)).regex(/^\d+$/, 'Potrebno je unijeti broj.')})
			else schema = schema.extend({[key]: z.string().refine((value)=>!value || new RegExp(/^\d+$/).test(value), 'Potrebno je unijeti broj.')})
			if(clientRendering) emptyForm[key]=''
		}
		else if(inputType === 'float') {
			if(required) schema = schema.extend({[key]: z.string().min(1, missingValueMessage(label)).refine((value)=>new RegExp(/^\d+(,\d+)*(\.\d+)?$/).test(value) || new RegExp(/^\d+(\.\d+)*(,\d+)?$/).test(value), 'Potrebno je unijeti broj.')})
			else schema = schema.extend({[key]: z.string().refine((value)=>!value || new RegExp(/^\d+(,\d+)*(\.\d+)?$/).test(value) || new RegExp(/^\d+(\.\d+)*(,\d+)?$/).test(value), 'Potrebno je unijeti broj.')})
			if(clientRendering) emptyForm[key]=''
		}
		else if(inputType==='text') {
			if(required) schema = schema.extend({[key]: z.string().min(1, missingValueMessage(label))})
			else schema = schema.extend({[key]: z.string()})
			if(clientRendering) emptyForm[key]=''
		}
		else if(inputType==='file') {
			if(required) {
				if(multiple) schema = schema.extend({[key]: z.array(z.any()).min(1, missingFileMessage(label)).refine((files)=>onlyFiles(files), filesOnly(label)).refine((files)=>checkFileTypes(files, fileTypes), invalidFileTypeMessage)})
				else schema = schema.extend({[key]: z.array(z.any()).min(1, missingFileMessage(label)).max(1, 'Nije dozvoleno unijeti više od jedne datoteke').refine((files)=>onlyFiles(files), filesOnly(label)).refine((files)=>checkFileTypes(files, fileTypes), invalidFileTypeMessage)})
			}
			else {
				if(multiple) schema = schema.extend({[key]: z.array(z.any())})
				else schema = schema.extend({ [key]: z.array(z.any()).max(1, 'Nije dozvoleno unijeti više od jedne datoteke') })
			}
			if(clientRendering) emptyForm[key]=[]
		}
		else if(inputType==='date') {
			if(required) schema = schema.extend({[key]: z.string().min(1, missingValueMessage(label)).refine((value)=>!value || isDate(value), 'Unesen je neispravan format datuma.')})
			else schema = schema.extend({[key]: z.string().refine((value)=>!value || isDate(value), 'Unesen je neispravan format datuma.')})
			if(clientRendering) emptyForm[key]=''
		}
	})

	function shouldRender(index: number, data:any) : boolean {
		let returnvalue = false
		let statisfied:number = 0
		const dependencies = fields[index].requireIfRendered ? fields[index].render.dependencies : fields[index].required.dependencies
		const statisfyAll = fields[index].requireIfRendered ? fields[index].render.statisfyAll : fields[index].required.statisfyAll
		if(fields[index].required.isRequired!=='conditional') return true
		else {
				dependencies.map((dependency)=>{
					const i = fields.map(({label})=>label).indexOf(dependency.label)
					const watchingItem = data[`a${i}`]
					if(Array.isArray(watchingItem)) {
						dependency.values.map((value)=>{
							if(watchingItem.includes(value)) {
								if(statisfyAll) ++statisfied
								else returnvalue = true; 
								return
							}
						})
					}
					else {
						if(dependency.values.includes(watchingItem)) {
							if(statisfyAll) ++statisfied
							else returnvalue = true; 
							return
						}
					}
				})	
		}
		if(fields[index]?.required.statisfyAll) {
			return statisfied===dependencies.length
		}
		else return returnvalue
	}

	fields.map((field, index, fields)=>{
		const key = `a${index}`
		if(field.required.isRequired==='conditional') {
			//@ts-expect-error
			schema = schema.refine((data:any)=>{
				if(shouldRender(index,data)) return isSet(data[key])
				else return true
			}, {path: [key], message: 'p ' + missingValueMessage(field.label)})
		}
	})
	return {schema:schema, emptyForm:emptyForm}
}