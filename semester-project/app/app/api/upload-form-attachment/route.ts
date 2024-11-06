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
				if(!clientPayload) throw new Error('Could not upload file');

				const payload = JSON.parse(clientPayload)
				const id = parseInt(payload.id)
				const field_index = parseInt(payload.field_index)

				if(isNaN(id)) throw new Error('Invalid submission id format or submission id not provided');
				if(isNaN(field_index)) throw new Error('Invalid field index format or field field index not provided');

				const submission = await db.submission.findUnique({
					where: {id: id},
					select: {
						time: true,
						form: {
							select: {
								id: true,
								fields: true,
								category: {
									select: {name: true}
								},
								department: {
									select: {name: true}
								}
							}
						}
					}
				})

				if(!submission) throw new Error('Submission does not exist.');
				else if(Date.now() - submission.time.getTime() > 4 * 60 * 1000) throw new Error('This submission has already been completed.')
				
				const field = (submission.form.fields as Field[])[field_index]
				if(!field) throw new Error('Field marked with provided index does not exist');

				if(field.inputType!=='file') throw new Error(`Field ${field.label} doesn't accept files.`);

				if(field.multiple) {
					const existingAttachments = await db.submission_attachment.findMany({select: {id: true}, where: {submission: {id: id}, field_index: field_index}})
					if(existingAttachments) throw new Error(`Field ${field.label} has already received file. No more files can be attached`)
				}
				await db.submission.update({where: {id: id}, data: {success: false}})
		
				return {
					allowedContentTypes: field.fileTypes,
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