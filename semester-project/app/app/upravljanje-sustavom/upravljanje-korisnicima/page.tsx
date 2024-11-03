import Loading from "../../components/Loading/loading"
import { AdminOnly } from "../../components/wrappers"
import { Suspense } from "react"
import { getUsers, getUsersCount } from "../../../lib/manage-users/manage-users"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import BorderedLink from "../../components/BorderedLink/button"
import PagesNavigation, {urlQuery} from "../../components/pages-navigation/PagesNavigation"
import ActionResultInfo from "../../components/actionResultInfo/actionResultInfo"
import '../adminPagesStyle.css'
import '../../moj-racun/settingsMenuStyle.css'
import { Error404 } from "../../components/error/errorXYZ"
import SeartchByFirstLetter from "../../components/SearchByFirstLetter/menu"
import FilterForm from "../../components/filter-menu/menu"
import { getRoles, getDepartments } from "../../../lib/db_qurery_functions"

export const metadata: Metadata = {
	title: 'Upravljanje korisnickim računima'
}

const basePath = 'upravljanje-sustavom/upravljanje-korisnicima'

export default async function Action({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {
	const { _limit, _page, _role, _department, _namestart, _surnamestart } = searchParams;

	return (
		<main>
			<AdminOnly>
				<h1>Pregled korisničkih računa</h1>
				<BorderedLink href={basePath+'/dodaj'} className="addUserLink">Dodaj novog korisnika</BorderedLink>
				<Suspense fallback={<Loading message="Učitavanje podataka o korisnicima" />}>
					<UserList page={_page ? Number(_page) : undefined} limit={_limit ? Number(_limit) : undefined} role={_role ? Number(_role) : undefined} department={_department ? Number(_department) : undefined} namestart={(_namestart || undefined) as (string | undefined)} surnamestart={(_surnamestart || undefined) as (string | undefined)}/>
				</Suspense>
			</AdminOnly>
		</main>
	)
}

async function UserList({page, limit, role, department, namestart, surnamestart}: {page?:number, limit?:number, role?: number, department?:number, namestart?:string, surnamestart?:string}) {
	const userCount = await getUsersCount(role, department, namestart, surnamestart)
	const totalPages = (userCount || 0)>0 ? Math.ceil((userCount || 0) / (limit || 1)) : 1
	const query : urlQuery = {
		...(page && !isNaN(page)) ? {'_page': page} : {},
		...(limit && !isNaN(limit)) ? {'_limit': limit} : {},
		...(role && !isNaN(role) ? {_role: role} : {}),
		...(department &&!isNaN(department) ? {_department: department} : {}),
		...(namestart ? {_namestart: namestart} : {}),
		...(surnamestart ? {_surnamestart: surnamestart} : {}),
	}
	
	const roles = await getRoles()
	const departments = await getDepartments()
	const users = await getUsers(page, limit, role, department, namestart, surnamestart)
	if(!users) return (<ActionResultInfo ok={false} message="Dogodila se greška pri učitavanju podataka o korisničkim računima"/>)
	
	else if(page && isNaN(page) || limit && isNaN(limit) || role && isNaN(role) || (page || 0) > totalPages) return (<Error404/>)
	else return (
		<>
			<FilterForm query={query} role_id={role} department_id={department} departments={departments || []} roles={roles || []}/>
			<SeartchByFirstLetter label="Ime:" basePath={basePath} query={query} current={namestart} param="_namestart"/>
			<SeartchByFirstLetter label="Prezime:" basePath={basePath} query={query} current={surnamestart} param="_surnamestart"/>
			
			{users?.length ?
				<>{page && limit && <PagesNavigation basePath={basePath} page={page} totalPages={totalPages} otherParams={query}/>}
				<section className='usersList _80ch'>
					{users.map((user)=>
						<div key={user.pin} className="userInfo">
							<Image src='/account-managment/user.png' alt='userIcon' width={40} height={40} />
							<div className="userDescription">
								<Link href={`${basePath}/${user.id}`}> <b>{user.name} {user.surname}</b> </Link>
								<p id='pin'>{user.pin}</p>
								<p id='role'>{user.role.name}</p>
							</div>
							<Link href={basePath + '/ukloni-korisnika/' + user.id}>
								<figure className="figure2"></figure>
							</Link>
						</div>
					)}
				</section>
				{page && limit && <PagesNavigation basePath={basePath} page={page} totalPages={totalPages} otherParams={query}/>} </>: 
				<h3 className="centerHorizontally">Nema korisničkih računa za učitati</h3>
			}
		</>
	)
}