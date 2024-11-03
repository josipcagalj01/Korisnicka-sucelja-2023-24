import { db } from "../../../lib/db";
import { transformStr } from "../../../lib/otherFunctions";
import { getSession } from "../../../lib/getSession";
import {del} from '@vercel/blob'

export async function POST(req: Request) {
	const {submission_id} = await req.json()
	if(!submission_id) return new Response(undefined, {status: 400})
	else {
		const submissionId = parseInt(submission_id)
		if(isNaN(submissionId)) return new Response(undefined, {status: 400})
		else {
			try {
				const {user} = await getSession() || {user: null}
				const submission = await db.submission.findUnique({
					select: {
						id: true,
						data: true,
						success: true,
						user: {
							select: {
								id: true
							}
						},
						form: {
							select: {
								id: true,
								fields: true,
								category: {
									select: {
										name:true
									},
								},
								department: {
									select: {
										name: true
									}
								}
							}
						}
					},
					where: {
						id: submissionId
					}
				})
				if(!submission) return new Response(undefined, {status: 400})
				else if(submission.user.id !== user?.id) return new Response(undefined, {status: 401})
				else if(!submission.success) {
					const savedFiles = await db.submission_attachment.findMany({
						select: {
							name: true,
							field_index: true
						}, 
						where: {
							submission: {
								id: submission.id
							}
						}
					})
					
					if(savedFiles.length) await del(savedFiles.map(({name})=>[transformStr(submission.form.category.name), transformStr(submission.form.department.name), `${submission.form.id}`, submission.id, name].join('/')))
					await db.$transaction([
						db.submission_attachment.deleteMany({where: {id: submission.id}}),
						db.submission.delete({where: {id: submission.id}})
					])
					return new Response(undefined, {status: 200})
				}
				else return new Response(undefined, {status: 409})
			} catch(error) {
				console.error(error)
				return new Response(undefined, {status: 500})
			}
		}
	}
}