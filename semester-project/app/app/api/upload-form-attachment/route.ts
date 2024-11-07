import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { Field } from '../../../lib/configureFormLib';

export async function POST(request: Request): Promise<NextResponse> {
	const body = (await request.json()) as HandleUploadBody;
	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async ( pathname, clientPayload ) => {
				console.log(clientPayload)
				
				return {
					allowedContentTypes: /*field.fileTypes*/['image/png', 'application/pdf'],
					tokenPayload: JSON.stringify({
						
					}),
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {

				console.log('blob upload completed', blob, tokenPayload);

				try {
					// Run any logic after the file upload completed
					const payload = JSON.parse(tokenPayload || '{}');
					await db.$transaction([
						db.submission_attachment.create({
							data: {
								submission: {connect: {id: payload.id}},
								name: blob.url.split('/').slice(-1)[0],
								field_index: payload.field_index
							},
						}),
						db.submission.update({data: {success: true}, where: {id: payload.id}})
					])
				} catch (error) {
					console.error(error)
					throw new Error('Could not update form');
				}
			}
		});
		return NextResponse.json(jsonResponse);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 }, // The webhook will retry 5 times waiting for a 200
		);
	}
}