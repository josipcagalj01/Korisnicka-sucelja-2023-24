import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getSession } from '../../../../lib/getSession';

interface Params {
	id: string
}

export async function POST(request: Request, {params}: {params: Params}): Promise<NextResponse> {
	const body = (await request.json()) as HandleUploadBody;
	try {
		const id = parseInt(params.id)
		const {user} = await getSession() || {user:null}
		if(isNaN(id)) return NextResponse.json({message: 'Unesen je krivi oblik oznake obrasca'}, {status: 400})
		else {
			const form = await db.form.findUnique({where: {id: id}})
			if(!form) return NextResponse.json({message: 'Ne postoji obrazac čija je oznaka navedena.'}, {status: 404})
			else if(user?.department_id !== form.department_id && (user?.role_id!==1 && user?.role_id!==3)) return NextResponse.json({message: 'Nemate dopuštenje izvesti ovu radnju.'}, {status: 403})
			else {
				const jsonResponse = await handleUpload({
					body,
					request,
					onBeforeGenerateToken: async (
						pathname,
						/* clientPayload */
					) => {
						// Generate a client token for the browser to upload the file
						// ⚠️ Authenticate and authorize users before generating the token.
						// Otherwise, you're allowing anonymous uploads.
		
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
		
						try {
							// Run any logic after the file upload completed
							// const { userId } = JSON.parse(tokenPayload);
							// await db.update({ avatar: blob.url, userId });
							/*const new_thumbnail = await db.form_thumbnail.create({data: {name: blob.url.split('/').slice(-1)[0]}})
							await db.form.update({
								data: {
									thumbnail: {
										connect: {id: new_thumbnail.id}
									},
									thumbnail_setting: 'existing'
								},
								where: {id: id}})*/
						} catch (error) {
							throw new Error('Could not update form');
						}
					},
				});
				return NextResponse.json(jsonResponse);
			}
		}
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 }, // The webhook will retry 5 times waiting for a 200
		);
	}
}