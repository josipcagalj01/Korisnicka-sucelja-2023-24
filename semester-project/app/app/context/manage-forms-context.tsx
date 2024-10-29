'use client'

import { createContext } from "react"
import { TemplateMenuOption } from "../../lib/db_qurery_functions"

type AddFormContextType = {
	categories: {id: number, name: string}[],
	departments: {id: number, name: string}[],
	existingForms?: TemplateMenuOption[],
	thumbnails: {id: number, name: string}[]
}

export const ManageFormsContext = createContext<AddFormContextType | null>(null)

export default function AddFormContext(props?:AddFormContextType & {children?: React.ReactNode}) {
	const {categories, departments, thumbnails, existingForms} = props || {categories: [], departments: [], thumbnails: [], existingForms: []}
	return (
		<ManageFormsContext.Provider value={{categories, departments, thumbnails, existingForms}} >
			{props?.children}
		</ManageFormsContext.Provider>
	)
}