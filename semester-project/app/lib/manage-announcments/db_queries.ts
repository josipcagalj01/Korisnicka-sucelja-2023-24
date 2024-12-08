import { db } from "../db";
import { getSession } from "../getSession";
import { newsProps } from "../../app/components/News/news";
import { announcment } from "@prisma/client";

export async function getAnnouncmentCategories() {
	try {
		const response = await db.announcment_category.findMany()
		return response
	} catch(error) {
		console.error(error)
		return null
	}
}

export async function getAnnouncmentForEmployee(id: number) {
	if(isNaN(id)) return null
	else {
		try {
			const {user} = await getSession() || {user: null}
			let where : any = {id:id}
			if(user?.role_id!==1 && user?.role_id!==3) where.department = {id: user?.department_id}

			const response = await db.announcment.findUnique({where: where})
			return response

		} catch(error) {
			console.error(error)
			return null
		}
	}
}

export async function getAnnouncmentThumbnails() {
	try {
		const response = await db.thumbnail.findMany()
		return response
	} catch(error) {
		console.error(error)
		return null
	}
}

export async function getAnnouncmentsCountForEmployee() {
	try {
		const {user} = await getSession() || {user: null}
		let where : any = {}
		if(user?.role_id!==1 && user?.role_id!==3) where.department = {id: user?.department_id}
		const count = await db.announcment.count({where: where})
		return count
	} catch(error) {
		console.error(error)
		return null
	}
}

export async function getAttachableForms() {
	try {
		const {user} = await getSession() || {user: null}
		let where : any = {}
		if(user?.role_id!==1 && user?.role_id!==3) where.department = {id: user?.department_id}
		const response = await db.form.findMany({
			select: {
				id: true,
				avalible_from: true,
				title: true,
				category: true,
				department_id:true
			},
			where: where
		})
		return response
	} catch(error) {
		console.error(error)
		return null
	}
}

export async function getExistingAttachments(id: number) {
	if(isNaN(id)) return null
	else {
		try {
			const {user} = await getSession() || {user: null}
			const announcment = await db.announcment.findUnique({where: {id: id}, select: {id: true, department_id: true, attachments: true}})
			if(user?.role_id!==1 && user?.role_id!==3 && user?.department_id!== announcment?.department_id) return null
			else {
				return announcment?.attachments.map(({id,name})=>({id: id, name: name.slice(0, name.lastIndexOf('-')) + name.slice(name.lastIndexOf('.'), name.length)}))
			}
		} catch(error) {
			console.error(error)
			return null
		}
	} 
}

export async function getAnnouncmentDataForDeleting(id: number) {
	if(isNaN(id)) return null
	try {
		const {user} = await getSession() || {user: null}
		const announcment = await db.announcment.findUnique({
			where: {id: id},
			select: {
				id: true,
				title: true,
				department_id: true
			}
		})
		if(announcment?.department_id!==user?.department_id && user?.role_id!==1 && user?.role_id!==3) return null
		else return announcment
	} catch(error) {
		console.error(error)
		return null
	}
}

export async function getAnnouncment(id: number) {
	if(isNaN(id)) return null
	else {
		try {
			const response = await db.announcment.findUnique({
				where: {id: id},
				select: {
					id: true,
					title: true,
					thumbnail_id: true,
					category: {
						select: {
							id: true,
							name: true
						}
					},
					content: true,
					date: true,
					attachments: {
						select: {
							id: true,
							name: true
						}
					},
					form: {
						select: {
							id: true,
							title: true
						}
					}
				}
			})
			if(!response) return null
			else {
				const {attachments, ...rest} = response || {attachments: null}
				return ({attachments: attachments ? attachments.map(({id, name})=>({id: id, name: name.slice(0, name.lastIndexOf('-')) + name.slice(name.lastIndexOf('.'), name.length)})) : null, ...rest})
			}
		} catch(error) {
			console.error(error)
			return null
		}
	}
}

export async function getAnnoumcmentsCount({forEmployees, categoryId}: {forEmployees?:boolean, categoryId?: number}) {
	if(categoryId && isNaN(categoryId)) return 0;
	else {
		try {
			let where: any = {}
			if(forEmployees) {
				const {user} = await getSession() || {user: null}
				if(user?.role_id!==1 && user?.role_id!==3) where.department = {id: user?.department_id || 0}
			}
			if(categoryId) where.category = {id: categoryId}
			const count = await db.announcment.count({where: where})
			return count
		} catch(error) {
			console.error(error)
			return -1;
		}
	}
}

export async function getNewsCardsData({forEmployees, offset, limit, category }: newsProps) {
	let query : any = {}
	if(offset) query.skip = offset
	if(limit) query.take = limit
	
	query.orderBy = [{avalible_from: 'desc'}, {title:'asc'}]
	query.select = {id:true, title:true, category: true, date:true, thumbnail_id: true, content: true}
	
	let where : {[key:string]: any} = {}
	if(forEmployees) {
		const {user} = await getSession() || {user: null}
		if(user?.role_id!==1 && user?.role_id!==3) where.department = {id: user?.department_id || 0}
	}

	if(category && !isNaN(category)) where.category = {id:category}

	try {
		query.where = where
		const response = await db.announcment.findMany({
			select: {id:true, title:true, category: true, date:true, thumbnail_id: true, content: true},
			skip: offset && !isNaN(offset) && limit && !isNaN(limit) ? offset : undefined,
			take: offset && !isNaN(offset) && limit && !isNaN(limit) ? limit : undefined,
			where: where,
		})

		return response.map((announcment)=>{
			const {content, ...rest} = announcment
			let obj : {summary: string} = {summary: ''}
			extractText(obj, (announcment.content as any).content)
			return ({summary: obj.summary, ...rest})
		})
	} catch(error) {
		console.error(error)
		return null
	}
}

function extractText(obj: {summary: string}, content?: any[]): void {
	if (!content) return
	else {
		content.forEach((node) => {
			if (node.type === 'text') {
				if (obj.summary.length < 350) {
					if (node.text) {
						const charsNeeded = 350 - obj.summary.length
						if (charsNeeded > 0) {
							const charsToTake = node.text.length > charsNeeded ? charsNeeded : node.text.length
							obj.summary += node.text.slice(0, charsToTake)
						}
					}
				}
			}
			extractText(obj, node.content)
		})
	}
}

export type announcmentTemplate = Omit<announcment, 'department_id' | 'date' | 'id' | 'sketch'> & {attach_form: boolean | null} | null

export async function getAnnouncmentTemplate(id: number) : Promise< announcmentTemplate> {
	if(isNaN(id)) return null
	else {
		try {
			const {user} = await getSession() || {user: null}
			const announcment = await db.announcment.findUnique({
				where: {id: id},
				select: {
					title: true,
					category_id: true,
					department_id: true,
					thumbnail_id: true,
					thumbnail_setting: true,
					content: true,
					form_id: true,
					sketch: true
				}
			})
			if(announcment) {
				if(announcment.sketch && announcment.department_id!==user?.department_id && user?.role_id!==1 && user?.role_id!==3) return null
				else {
					const {department_id, sketch, ...rest} = announcment
					return {attach_form: rest.form_id ? true: null, ...rest}
				}
			}
			else return null
		} catch(error) {
			console.error(error)
			return null
		}
	}
}

export type existingAnnouncment = Pick<announcment, 'id' | 'title' | 'date'> & {category: {name: string}}

export async function getExistingAnnouncments() : Promise<existingAnnouncment[] | null> {
	try {
		const {user} = await getSession() || {user: null}
		let where : any = {}
		if(user?.role_id!==1 && user?.role_id!==3) where.OR = [{sketch: false}, {department: {id: user?.department_id}}]
		const announcments = await db.announcment.findMany({
			where: where,
			select: {
				id: true,
				title: true,
				category: {
					select: {
						name: true
					}
				},
				date: true
			}	
		})
		return announcments
	} catch(error) {
		console.error(error)
		return null
	}
}
