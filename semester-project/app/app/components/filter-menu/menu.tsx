'use client'
import styles from './filterMenuStyle.module.css'

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from 'react'
import DeleteIcon from '../delete-icon/delete-icon'
import { urlQuery } from '../pages-navigation/PagesNavigation'

export default function FilterForm({query, className='', department_id, departments, roles, role_id}: {query: urlQuery, className?:string, department_id?:number, departments:{id: number, name: string}[], roles: {name: string, id:number}[], role_id?:number}) {
	const [departmentId, setDepartmentId] = useState(0)
	const [roleId, setRoleId] = useState(0)

	const router = useRouter()
	const path = usePathname()

	const {_role, _department, ...rest} = query
	useEffect(
		()=>{
			if(department_id) setDepartmentId(!isNaN(department_id) ? department_id : 0)
			if(role_id) setRoleId(!isNaN(role_id || 0) ? role_id : 0)
		},[department_id, role_id]
	)

	useEffect(
		()=>{
			const redirectUrl = path + '?' + Object.entries(rest).map(([key, value])=>`${key}=${value}`).join('&') + (departmentId ? `&_department=${departmentId}` : '') + (roleId ? `&_role=${roleId}` : '')
			router.push(redirectUrl)
		},[departmentId, roleId]
	)

	return (
		<form className={className + ' ' + styles.filterMenu}>
			<div className={styles.labelAndSelect}>
				<label htmlFor='typeIndex'>Kategorija korisnika</label>
				<div className={styles.selectContainer}>
					<select title='typeIndex' name='typeIndex' onChange={(e)=>setRoleId(Number(e.currentTarget.value || 0))} value={roleId}>
						<option disabled value={0} className="displaynone"></option>
						{roles.map(({id, name})=><option key={name} value={id}>{name}</option>)}
					</select>
					{roleId>0 && <DeleteIcon className={styles.deleteicon} onClick={()=>{if(roleId) setRoleId(0)}} size={14} thickness={2}/>}
				</div>
			</div>
			<div className={styles.labelAndSelect}>
				<label htmlFor='departmentId'>Odjel</label>
				<div className={styles.selectContainer}>
					<select title='departmentId' name='departmentId' onChange={(e)=>setDepartmentId(Number(e.currentTarget.value || 0))} value={departmentId}>
						<option disabled value={0} className="displaynone"></option>
						{departments.map(({id,name})=><option key={name} className={id===departmentId ? 'displaynone' : ''} value={id}>{name}</option>)}
					</select>
					{departmentId>0 && <DeleteIcon className={styles.deleteicon} onClick={()=>{if(departmentId) setDepartmentId(0)}} size={14} thickness={2}/>}
				</div>
			</div>
		</form>
	)
}