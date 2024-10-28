import Loading from "../../components/Loading/loading"
import { AdminOnly } from "../../components/wrappers"
import { Suspense } from "react"
import { getUsers } from "../../../lib/manage-users/manage-users"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import BorderedLink from "../../components/BorderedLink/button"
import PagesNavigation, {urlQuery} from "../../components/pages-navigation/PagesNavigation"
import ActionResultInfo from "../../components/actionResultInfo/actionResultInfo"
import '../adminPagesStyle.css'
import '../../moj-racun/settingsMenuStyle.css'
import { Error404 } from "../../components/error/errorXYZ"

export const metadata: Metadata = {
	title: 'Upravljanje korisnickim računima'
}

const basePath = '/upravljanje-sustavom/upravljanje-korisnicima'

export default async function Action({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {
	const { _limit, _page, _category } = searchParams;

	return (
		<main>
			<AdminOnly>
				<h1>Pregled korisničkih računa</h1>
				<BorderedLink href={basePath+'/dodaj'} className="addUserLink">Dodaj novog korisnika</BorderedLink>
				<Suspense fallback={<Loading message="Učitavanje podataka o korisnicima" />}>
					<UserList page={_page ? Number(_page) : undefined} limit={_limit ? Number(_limit) : undefined} category={_category ? Number(_category) : undefined}/>
				</Suspense>
			</AdminOnly>
		</main>
	)
}

async function UserList({page, limit, category}: {page?:number, limit?:number, category?: number}) {
	const query : urlQuery = {...(limit && isNaN(limit)) ? {'_limit': limit} : {}, ...(category && !isNaN(category) ? {_category: category} : {})}
	const users = await getUsers(page, limit, category)
	if(!users) return (<ActionResultInfo ok={false} message="Dogodila se greška pri učitavanju podataka o korisničkim računima"/>)
	
	else if(page && isNaN(page) || limit && isNaN(limit) || category && isNaN(category) || (page || 0) > Math.ceil(users.length / (limit || 1))) return (<Error404/>)
	else if(!users.length) return (<h3 className="noDataMessage">Nema korisničkih računa za učitati</h3>)
	else return (
		<>
			{page && limit && <PagesNavigation basePath={basePath} page={page} totalPages={Math.ceil(users.length / limit)} otherParams={query}/>}
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
		</>
	)
}