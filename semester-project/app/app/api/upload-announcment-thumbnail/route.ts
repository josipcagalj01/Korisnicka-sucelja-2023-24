import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getSession } from '../../../lib/getSession';

interface Params {
	id: string
}

export async function POST(request: Request, {params}: {params: Params}): Promise<NextResponse> {
	const body = (await request.json()) as HandleUploadBody;
	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname, clientPayload) => {
				const payload = JSON.parse(clientPayload || '')
				const id = parseInt(payload.id)
				const { user } = await getSession() || { user: null }
				if (isNaN(id)) throw new Error('Invalid announcment id format provided')
				else {
					const announcment = await db.announcment.findUnique({ where: { id: id } })
					if (!announcment) throw new Error('Form whose id is ... does not exist')
					else if (user?.department_id !== announcment.department_id && (user?.role_id !== 1 && user?.role_id !== 3)) throw new Error('Access denied')
				}

				return {
					allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
					tokenPayload: JSON.stringify({
						// optional, sent to your server on upload completion
						// you could pass a user id from auth, or a value from clientPayload
					}),
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {
				// Get notified of client upload completion
				// ⚠️ This will not work on `localhost` websites,
				// Use ngrok or similar to get the full upload flow

				console.log('blob upload completed', blob, tokenPayload);
				const id = parseInt(params.id)
				try {
					const new_thumbnail = await db.thumbnail.create({ data: { name: blob.url.split('/').slice(-1)[0] } })
					await db.announcment.update({
						data: {
							thumbnail: {
								connect: { id: new_thumbnail.id }
							},
							thumbnail_setting: 'existing'
						},
						where: { id: id }
					})
				} catch (error) {
					throw new Error('Could not update form');
				}
			},
		});
		return NextResponse.json(jsonResponse);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 }, // The webhook will retry 5 times waiting for a 200
		);
	}
}