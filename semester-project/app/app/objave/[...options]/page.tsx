import type { Metadata } from "next";
import { ParticularDepartmentOnly, EmployeesOnly } from "../../components/wrappers";
import { Suspense } from "react";
import Loading from "../../components/Loading/loading";
import AddAnnouncment from "../../components/announcment-managment/add-announcment";
import EditAnnouncment from "../../components/announcment-managment/edit-announcment";
import AnnouncmentManagment from "../../context/manage-announcment-context";
import {getAnnouncmentCategories, getAnnouncmentDataForDeleting, getAnnouncmentForEmployee, getAnnouncmentThumbnails, getAttachableForms, getExistingAttachments, announcmentTemplate, getAnnouncmentTemplate, getExistingAnnouncments, existingAnnouncment } from "../../../lib/manage-announcments/db_queries";
import { getDepartments } from "../../../lib/db_qurery_functions";
import { Error404 } from "../../components/error/errorXYZ";
import styles from '../../obrasci/editableFormsStyle.module.css'
import BorderedLink from "../../components/BorderedLink/button";
import { MultipleParams } from "../../../lib/interfaces";
import DeleteAnnouncment from "../../components/announcment-managment/deleteAnnouncment";

async function getMetadata(stringId: string, toDelete: boolean) {
	const id = parseInt(stringId)
		if (Number.isNaN(id)) return { title: 'Greška' }
		const {title} = await getAnnouncmentForEmployee(id) || {title: null}
		if(!title) return { title: 'Greška' }
		else return ({title: `${toDelete ? 'Uklanjanje objave ' : 'Pregled objave '} ${title}`})	
}

export async function generateMetadata({params}: {params:MultipleParams}) : Promise<Metadata> {
	if(params.options.length===1) {
		if(params.options[0]==='dodaj-novu-objavu') return {title: 'Nova objava'}
		else return getMetadata(params.options[0], false)
	}
	else if(params.options.length===2 && params.options[0]==='ukloni') return getMetadata(params.options[1], true)
	else return { title: 'Greška' }
}

export default function CreateOrEditArticle({params, searchParams}: {params: MultipleParams, searchParams: Record<string, string | string[] | undefined>}) {
	return (
		<main className="_80ch formMain">
			<Suspense fallback={<Loading message="Učitavanje" />}>
				<Render params={params} searchParams={searchParams}/>
			</Suspense>
		</main>
	)
}

async function Render({params, searchParams}: {params: MultipleParams, searchParams: Record<string, string | string[] | undefined>}) {
	const departments = await getDepartments()
	const categories = await getAnnouncmentCategories()
	const thumbnails = await getAnnouncmentThumbnails()
	const forms = await getAttachableForms()

	if(params.options.length===1) {
		if(params.options[0]==='dodaj-novu-objavu') {
			let existingAnnouncment: announcmentTemplate | undefined = undefined
			let existingAnnouncments : existingAnnouncment[] | null | undefined = undefined
			const {_templateid} = searchParams
			const templateId = parseInt(_templateid as string)
			if(_templateid && isNaN(templateId)) return (<Error404/>)
			else {
				if(templateId) existingAnnouncment = await getAnnouncmentTemplate(templateId)
				else existingAnnouncments = await getExistingAnnouncments()
				return (
					<EmployeesOnly>
						<h1 className={styles.h1}>Nova obavijest</h1>
						<AnnouncmentManagment categories={categories || []} departments={departments || []} thumbnails={thumbnails || []} existingForms={forms || []} existingAnnouncments={existingAnnouncments}>
							<AddAnnouncment configuration={existingAnnouncment}/>
						</AnnouncmentManagment>
					</EmployeesOnly>
				)
			}
		}
		else {
			const id = parseInt(params.options[0])
			if(isNaN(id)) return (<Error404 />)
			else {
				const announcment = await getAnnouncmentForEmployee(id)
				if(!announcment) (<Error404 />)
				else {
					const existingAttachments = await getExistingAttachments(id)
					return (
						<ParticularDepartmentOnly id={announcment.department_id}>
							<h1 className={styles.h1}>Pregled objave</h1>
							<h2>{announcment.title}</h2>
							<div className={styles.buttons}>
								<BorderedLink href={'/objave/dodaj-novu-objavu?_templateid='+id}>Koristi ovu objavu kao predložak</BorderedLink>
								<BorderedLink href={'/objave/ukloni/' + id}>Izbriši objavu</BorderedLink>
							</div>
							<AnnouncmentManagment categories={categories || []} departments={departments || []} thumbnails={thumbnails || []} existingForms={forms || []} existingAttachments={existingAttachments}>
								<EditAnnouncment props={{attach_form: announcment.form_id ? true : false, ...announcment}}/>
							</AnnouncmentManagment>
						</ParticularDepartmentOnly>
					)
				}
			}
		}
	}
	else if(params.options.length===2 && params.options[0]==='ukloni') {
		const id = parseInt(params.options[1])
		if(isNaN(id)) return (<Error404 />)
		else {
			const announcment = await getAnnouncmentDataForDeleting(id)
			if(!announcment) return (<Error404/>)
			else return (
				<ParticularDepartmentOnly id={announcment.department_id}>
					<h1 className={styles.h1}>Uklanjanje objave</h1>
					<h2>{announcment.title}</h2>
					<DeleteAnnouncment id={id}/>
				</ParticularDepartmentOnly>
			)
		}
	}
	else return (<Error404/>)
}