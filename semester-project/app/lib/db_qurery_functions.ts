import { db } from "./db";
import { newsProps } from "../app/components/News/news";
import { Field, Form } from "./configureFormLib";
import { getSession } from "./getSession";
import type * as Prisma from '@prisma/client'

export interface Category {
	id: number,
	name:string
}

interface categoryList {
	success : boolean,
	categories?: Category[]
}

export async function getTotalCount({tableName, condition}:{tableName:string, condition?:any}):Promise<number> {
	try {
		if(tableName in db) {
			// @ts-ignore
			const response = await db[tableName].count(condition)
			return response===undefined ? -2 : response
		}
		else return -3
	}catch(error) {
		console.error(error)
		return -1;
	}
}

export async function getFormsCountForEmployees (props?: {condition:any}):Promise<number> {
	try {
		const {user} = await getSession() || {user: null}
			
		let where: any = {...props?.condition}
		if(user?.role_id!==1 && user?.role_id!==3) where.department = {id: user?.department_id || 0}

		const response = await db.form.count({where: where})
		return response===undefined ? -2 : response
		
	}catch(error) {
		console.error(error)
		return -1;
	}
}

export async function getSubmissionsCountForEmployees (props?: {condition:any}):Promise<number> {
	try {
		const {user} = await getSession() || {user: null}
			
		let where: any = {...props?.condition}
		if(user?.role_id!==1 && user?.role_id!==3) where.user.department = {id: user?.department_id || 0}

		const response = await db.submission.count({where: where})
		return response===undefined ? -2 : response
		
	}catch(error) {
		console.error(error)
		return -1;
	}
}

export async function getCategories():Promise<categoryList> {
	try {
		const response:Category[] = await db.category.findMany()
		return {success:true, categories:response}
	}catch(error){
		console.error(error)
		return {success:false}
	}
}

export async function getDepartments():Promise<{id: number, name: string}[] | null> {
	try {
		const response = await db.department.findMany()
		return response
	}catch(error){
		console.error(error)
		return null
	}
}

export async function getRoles():Promise<{id: number, name: string}[] | null> {
	try {
		const response = await db.role.findMany()
		return response
	}catch(error){
		console.error(error)
		return null
	}
}

interface formsCardData {
	id:number,
	title:string,
	category: Category,
	avalible_from: Date,
	avalible_until: Date,
	thumbnail_id: number | null
}

interface formsPackage {
	count : number,
	forms : formsCardData[]
}

export async function getForms({ offset, limit, desiredId, category }: newsProps) : Promise<formsPackage> {
	let query : any = {}
	
	if(offset) query.skip = offset
	if(limit) query.take = limit
	
	query.orderBy = [{avalible_from: 'desc'}, {title:'asc'}]
	query.select = {id:true, title:true, category: true, avalible_from:true, thumbnail_id: true}
	
	let where : {[key:string]: any} = {
		avalible_from: {lte: new Date(Date.now())},
		sketch: false,
		OR: [
			{avalible_until: null},
			{avalible_until:{gte: new Date(Date.now())}}
		]
	}

	try {
		if(desiredId || category) {
			const categoryId = await db.category.findUnique({select:{id:true}, where:{name:category}})
			if(desiredId) where.desiredId = desiredId
			if(category) where.category_id = categoryId?.id	
		}
		query.where = where
		const response : any = await db.form.findMany(query)
		return {count:response.length, forms: response}
	}catch(error) {
		console.error(error)
		return {count:-1, forms:[]}
	}
}

export interface TemplateMenuOption {
	id: number,
	title: string,
	category: {
		name: string
	},
	department_id: number,
	avalible_from: Date | null
}

export async function getForms2() : Promise<TemplateMenuOption[] | null> {
	try {
		const response = await db.form.findMany({select: {
			id: true,
			title: true,
			category: {
				select: {
					name: true
				}
			},
			department_id: true,
			avalible_from: true,
		}})
		return response
	} catch(error) {
		console.error(error)
		return null
	}
}

export async function getFormsForEmployees({ offset, limit, desiredId, category }: newsProps) : Promise<formsPackage> {
	const {user} = await getSession() || {user: null}
	let query : any = {}
	
	if(offset) query.skip = offset
	if(limit) query.take = limit
	
	query.orderBy = [{avalible_from: 'desc'}, {title:'asc'}]
	query.select = {id:true, title:true, category: true, avalible_from:true, thumbnail_id: true}
	
	let where : {[key:string]: any} = {}

	if(user?.role_id!==1 && user?.role_id!==3) where.department = {id: user?.department_id || 0}

	try {
		if(desiredId || category) {
			const categoryId = await db.category.findUnique({select:{id:true}, where:{name:category}})
			if(desiredId) where.desiredId = desiredId
			if(category) where.category_id = categoryId?.id	
		}
		query.where = where
		const response : any = await db.form.findMany(query)
		return {count:response.length, forms: response}
	}catch(error) {
		console.error(error)
		return {count:-1, forms:[]}
	}
}

export interface FormConfiguration {
	id: number,
	category : {
		id:number,
		name:string
	},
	rate_limit: number | null,
	department: {
		id: number,
		name: string
	},
	avalible_from: Date | null,
	avalible_until : Date | null,
	title: string,
	fields: Field[],
	sketch: boolean
}

export async function getFormConfiguration(id: number) : Promise<FormConfiguration | null> {
	try {
		const response = await db.form.findUnique({
			select:{id: true, category:{select:{id:true, name:true}}, fields:true, avalible_from:true, avalible_until:true, title:true, department: {select: {id: true, name: true}}, rate_limit:true, sketch:true},
			where:{id:id, sketch:false}
		})
		if(response) {
			const {fields, ...rest} = response
			return {fields: fields as Field[], ...rest}
		}
		else return null
	} catch(error) {
		console.error
		return null
	}
}

type formConfiguration2 = {form: Form & {id:number}} & {recordsExist: boolean}

export async function getFormConfigurationForEmployee(id: number) : Promise<formConfiguration2 | null> {
	try {
		let where : any = {id:id}
		const {user} = await getSession() || {user:null}
		if(user?.role_id!==1 && user?.role_id!==3) where.department = {id: user?.department_id}
		const response = await db.form.findUnique({where: where })
		
		if(response) {
			const {author_id, avalible_from, rate_limit, avalible_until, fields, ...rest} = response
			let recordsExist : boolean
			const count = await db.submission.count({
				where: {
					form: {id: id}
				}
			})
			recordsExist = count ? true : false
			return ({
				recordsExist: recordsExist,
				form:{
					avalible_from: avalible_from ?  `${avalible_from.toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb'}).split(/\.\s*/).toReversed().slice(1).join('-')}T${avalible_from.toLocaleTimeString('hr-HR', {timeZone: 'Europe/Zagreb'}).slice(0,5)}` : '',
					avalible_until: avalible_until ? `${avalible_until.toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb'}).split(/\.\s*/).toReversed().slice(1).join('-')}T${avalible_until.toLocaleTimeString('hr-HR', {timeZone: 'Europe/Zagreb'}).slice(0,5)}` : '',
					fields: fields as Field[],
					rate_limit: rate_limit?.toString() || '',
					...rest
				}
			})
		}
		else return null
	} catch(error) {
		console.error
		return null
	}
}

export async function getFormTemplate(id: number) {
	try {
		const response = await db.form.findUnique({
			where: {id: id},
		})
		if(!response) return null
		else {
			const {id, avalible_from, avalible_until, fields, rate_limit, author_id, ...rest} = response
			return ({
				avalible_from: avalible_from ?  `${avalible_from.toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb'}).split(/\.\s*/).toReversed().slice(1).join('-')}T${avalible_from.toLocaleTimeString('hr-HR', {timeZone: 'Europe/Zagreb'}).slice(0,5)}` : '',
				avalible_until: avalible_until ? `${avalible_until.toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb'}).split(/\.\s*/).toReversed().slice(1).join('-')}T${avalible_until.toLocaleTimeString('hr-HR', {timeZone: 'Europe/Zagreb'}).slice(0,5)}` : '',
				fields: fields as Field[],
				rate_limit: rate_limit?.toString() || '',
				...rest
			})

		}
	} catch(error) {
		console.error
		return null
	}
}

type formConfiguration3 = Omit<FormConfiguration, 'sketch' | 'rate_limit' | 'department' | 'avalible_until'>

export async function getFormConfiguration3(id: number) : Promise<formConfiguration3 | null> {
	try {
		let where : any = {id:id}
		const {user} = await getSession() || {user:null}
		if(user?.role_id!==1 && user?.role_id!==3) where.department = {id: user?.department_id || 0}
		const response = await db.form.findUnique({
			where: where,
			select: {
				id:true,
				title: true,
				category: true,
				fields: true,
				avalible_from: true
			}
		})
		if(response) {
			const {fields, ...rest} = response
			return {fields: fields as Field[], ...rest}
		}
		else return null
	}
	catch(error) {
		console.error(error)
		return null
	}
}

export async function getThumbnails() : Promise <{id: number, name: string}[] | null> {
	try {
		const thumbnails = await db.form_thumbnail.findMany()
		return thumbnails.map(({id,name})=>{
			const splitted = name.split('-')
			const extension = name.slice(name.lastIndexOf('.'), name.length)
			return ({id: id, name: splitted.slice(0, splitted.length-1).join('-') + extension || ''})
		})
	} catch(error) {
		console.error(error)
		return null
	}
}

type SubmissionBasicInfo = {
	id: number,
	user: {
		id:number,
		name: string,
		surname: string,
		pin: string,
		email: string
	},
	time: Date
}

export async function getSubmissions(id: number, offset: number, limit: number) : Promise<SubmissionBasicInfo[] | null> {
	try {
		const {user} = await getSession() || {user:null}
		let where : any = {form: {id:id}}
		if(user?.role_id!==1 && user?.role_id!==3) where.form ={department: {id: user?.department_id || 0}}
		const response = await db.submission.findMany({
			where: where,
			select: {
				id:true,
				user: {
					select: {
						pin:true,
						id:true,
						name: true,
						surname: true,
						email: true
					},
					
				},
				time: true
			},
			skip:(limit && offset) ? offset : undefined,
			take: (limit && offset) ? limit : undefined,
			orderBy: [
				{time: 'asc'}
			]
		})
		return response
	} catch(error) {
		console.error(error)
		return null
	}
}

type submissionData = Omit<Prisma.submission, 'user_id' | 'form_id'> & {user: Omit<Prisma.user, 'password' | 'id' | 'role_id' | 'department_id' | 'username'>} & {form: (Pick<Prisma.form, 'id' | 'title' | 'fields'> & {category: Pick<Prisma.category, 'name'>} & {department: Pick<Prisma.department, 'name'>})}

export async function getSubmission(id: number) : Promise<submissionData | null> {
	try {
		const {user} = await getSession() || {user:null}
		let where : any = {id: id}
		if(user?.role_id!==1 && user?.role_id!==3) where.form = {department: {id: user?.department_id || 0}}
		const [response, ...rest] = await db.submission.findMany({
			select: {
				id: true,
				data:true,
				time: true,
				user: {
					select: {
						pin: true,
						name: true,
						surname: true,
						email: true,
						place: true,
						town: true,
						street: true,
						house_number: true,
						birth_date: true
					}
				},
				form: {
					select: {
						id:true,
						title: true,
						category: {
							select: {
								name: true
							}
						},
						department: {
							select: {
								name: true
							}
						},
						fields: true
					}
				}
			},
			where: where
		})
		if(response) {
			const {data, ...rest} = response
			let dataToReturn : any = {...data as any}
			if((rest.form.fields as Field[] | null)?.some(({inputType})=>inputType==='file')) {
				const attachments = await db.submission_attachment.findMany({where: {submission: {id: id}}, select: {id: true, name: true, field_index: true}})
				attachments.forEach(({id, name, field_index})=>{
					if(!dataToReturn[`a${field_index}`]) dataToReturn[`a${field_index}`] = []
					const splitted = name.split('-')
					const extension = name.slice(name.lastIndexOf('.'), name.length)
					dataToReturn[`a${field_index}`].push({id: id, name: splitted.slice(0, splitted.length-1).join('-') + extension || ''})
				})
			}
			return {data:dataToReturn, ...rest}
		}
		else return null
	}catch(error) {
		console.error(error)
		return null
	}
}

export async function getSubmissionDepartmentId(id: number) {
	try {
		if(!isNaN(id)) {
			const response = await db.submission.findUnique({where: {id: id}, select: {form: {select: {department_id: true}}}})
			if(response) return response.form.department_id
			else return null
		}
		else return null
	}catch(error) {
		console.error(error)
		return null
	}
}

export async function getFormDepartmentId(id: number) {
	try {
		if(!isNaN(id)) {
			const response = await db.form.findUnique({where: {id: id}, select: {department_id: true}})
			if(response) return response.department_id
			else return null
		}
		else return null
	}catch(error) {
		console.error(error)
		return null
	}
}

export async function getRate(formId?: number) : Promise<number> {
	if(!formId) return -1
	const session = await getSession()
	try {
		const {count} : any = await db.submission.count({
			where: {
				form: {id: formId},
				user: {id: session?.user.id}
			}
		})
		return Number(count) 
	} catch(error) {
		console.error(error)
		return -1;
	}
}