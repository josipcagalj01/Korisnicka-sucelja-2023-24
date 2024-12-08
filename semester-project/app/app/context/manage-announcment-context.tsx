'use client'

import { createContext } from "react"

type ManageAnnouncmentContextType = {
	categories: {id: number, name: string}[],
	departments: {id: number, name: string}[],
	thumbnails: {id: number, name: string}[],
	existingForms: {id:number, title: string, category:{id:number, name: string}, avalible_from: Date | null, department_id:number}[],
	existingAttachments?: {id: number, name: string}[] | null,
	existingAnnouncments?: {id: number, title: string, category: {name: string}, date: Date}[] | null
}

export const ManageAnnouncmentContext = createContext<ManageAnnouncmentContextType | null>(null)

export default function AnnouncmentManagment(props?:ManageAnnouncmentContextType & {children?: React.ReactNode}) {
	const {categories, departments, thumbnails, existingForms, existingAttachments, existingAnnouncments} = props || {categories: [], departments: [], thumbnails: [], existingForms: []}
	return(
		<ManageAnnouncmentContext.Provider value={{categories, departments, thumbnails, existingForms, existingAttachments, existingAnnouncments}}>
			{props?.children}
		</ManageAnnouncmentContext.Provider>
	)
}