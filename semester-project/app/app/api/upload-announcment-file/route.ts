import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getSession } from '../../../lib/getSession';
import { fileTypes } from '../../../lib/configureFormLib';

export async function POST(request: Request): Promise<NextResponse> {
	const body = (await request.json()) as HandleUploadBody;
	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async ( pathname, clientPayload ) => {
				if(!clientPayload) throw new Error('Could not upload file');

				const payload = JSON.parse(clientPayload)
				const id = parseInt(payload.id)

				if(isNaN(id)) throw new Error('Invalid announcment id format or announcment id not provided');

				const announcment = await db.announcment.findUnique({
					where: {id: id},
					select: {
						department_id: true
					}
				})

				const {user} = await getSession() || {user: null}

				if(!announcment) throw new Error('Submission does not exist.');
				else if(announcment.department_id!== user?.department_id && user?.role_id!==1 && user?.role_id!==3) throw new Error(`User ${user?.name} ${user?.surname} does not have permission to attach files to attachment with id + ${id}`)
		
				return {
					allowedContentTypes: fileTypes.map(({type})=>type),
					tokenPayload: JSON.stringify({
						...payload
					}),
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {

				console.log('blob upload completed', blob, tokenPayload);

				try {
					// Run any logic after the file upload completed
					const payload = JSON.parse(tokenPayload || '{}');
					await db.announcment_attachment.create({
						data: {
							announcment: {connect: payload.id},
							name: blob.url.split('/').slice(-1)[0]
						}
					})
				} catch (error) {
					console.error(error)
					throw new Error('Could not add info about new attachment');
				}
			},
		});
		return NextResponse.json(jsonResponse);
	} catch (error) {
		console.error(error)
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 }, // The webhook will retry 5 times waiting for a 200
		);
	}
}