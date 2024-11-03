import PagesNavigation, {urlQuery} from "../../components/pages-navigation/PagesNavigation";
import { Error404 } from "../../components/error/errorXYZ";
import { Metadata } from "next";
import { ParticularDepartmentOnly } from "../../components/wrappers";
import { getFormConfiguration3, getSubmissions, getFormDepartmentId, getSubmissionsCount, } from "../../../lib/db_qurery_functions";
import { Suspense } from "react";
import Loading from "../../components/Loading/loading";
import ActionResultInfo from "../../components/actionResultInfo/actionResultInfo";
import '../../obavijesti/[announcmentId]/newsPageStyle.css'
import BorderedLink from "../../components/BorderedLink/button";
import styles from '../submissionsStyle.module.css'
import Link from "next/link";
import SeartchByFirstLetter from "../../components/SearchByFirstLetter/menu";

interface Params {
	serviceId: string
}

export const generateMetadata = async ({ params }: { params: Params}): Promise<Metadata> => {
	const id = parseInt(params.serviceId)
	if (Number.isNaN(id)) return { title: 'Greška' }
	const Form = await getFormConfiguration3(id);
	if (!Form) return { title: 'Greška' }
	else return { title: 'Pregled prijava za ' + Form.title }
}

export default async function ParticularFormSubmissions({params, searchParams}: {params: Params, searchParams: Record<string, string | string[] | undefined>;}) {
	const id = parseInt(params.serviceId)
	const department_id = await getFormDepartmentId(id)
	return (
		<main>
			<ParticularDepartmentOnly id={department_id || 0}>
				<Suspense fallback={<Loading message="Prijave se učitavaju..."/>}>
					<Render params={params} searchParams={searchParams}/>
				</Suspense>
			</ParticularDepartmentOnly>
		</main>
	)
}

async function Render({params, searchParams}: {params: Params, searchParams: Record<string, string | string[] | undefined>;}) {

	const { _limit, _page, _namestart, _surnamestart} = searchParams;
	const nameStart = _namestart ? _namestart as string : undefined
	const surnameStart = _surnamestart ? _surnamestart as string : undefined
	
	const [pageSize, page] = [_limit, _page].map(Number);

	const id = parseInt(params.serviceId)
	if(isNaN(id)) return (<Error404/>)
	else {
		const count = await getSubmissionsCount(id, nameStart, surnameStart)
		const totalPages = (count || 0)>0 ? Math.ceil((count || 0) / (pageSize || 1)) : 1
		const submissions = await getSubmissions(id, pageSize * (page - 1), pageSize, nameStart, surnameStart)

		const query : urlQuery = {
			...(page && !isNaN(page)) ? {'_page': page} : {},
			...(_limit && !isNaN(pageSize)) ? {'_limit': pageSize} : {},
			...(nameStart ? {_namestart: nameStart as string} : {}),
			...(surnameStart ? {_surnamestart: surnameStart as string} : {}),
		}
		
		const form = await getFormConfiguration3(id)
		if(!form || (page>totalPages)) return (<Error404/>)
		else {
			return(
				<>
					<h1 className={styles.h1}>{form.title}</h1>
					<h2 className="serviceTitle">Pristigle prijave</h2>
					<p className={styles.dateAndCategory}>{form.avalible_from?.toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb'})} | {form.category.name}</p>
					<BorderedLink href={'/obrasci/'+form.id} className={styles.editFormLink}>Postavke obrasca</BorderedLink>
					{!submissions && <ActionResultInfo ok={false} message="Nije moguće učitati podatke o ispunjavanju ovog obrasca" />}
					{submissions && 
						<>
							<SeartchByFirstLetter label='Ime podnositelja' query={query} basePath={`/prijave/${id}`} current={_namestart ? _namestart as string : undefined} param="_namestart"/>
							<SeartchByFirstLetter label='Prezime podnositelja' query={query} basePath={`/prijave/${id}`} current={_surnamestart ? _surnamestart as string : undefined} param="_surnamestart"/>
						</>
					}
					{submissions?.length ?
						<>
							{!isNaN(pageSize) && !isNaN(page) && <PagesNavigation basePath={`prijave/${id}`} page={page} totalPages={totalPages} otherParams={query}/>}
							<div className={styles.scrollWrapper}>
								<table className={styles.submissionsList + ' ' + styles.formSubmissions}>
									<thead>
										<tr>
											<th>R. br</th>
											<th>OIB podnositelja</th>
											<th>Prezime podnositelja</th>
											<th>Ime podnositelja</th>
											<th>Adresa e-pošte podnositelja</th>
											<th>Vrijeme podnošenja prijave</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{submissions.map((submission, index)=>
											<tr key={submission.id}>
												<td>{pageSize*(page-1)+index+1}.</td>
												<td>{submission.user.pin}</td>
												<td>{submission.user.surname}</td>
												<td>{submission.user.name}</td>
												<td>{submission.user.email}</td>
												<td>{submission.time.toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb'})} {submission.time.toLocaleTimeString('hr-HR', {timeZone: 'Europe/Zagreb'})}</td>
												<td><b><Link href={'/prijave/' + form.id + '/'+ submission.id}>Prikaži detalje</Link></b></td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
							{!isNaN(pageSize) && !isNaN(page) && <PagesNavigation basePath={`prijave/${id}`} page={page} totalPages={totalPages} otherParams={query}/>}
						</>: 
						<h3 className={styles.centerHorizontally}>Nema prijava za prikazati</h3>
					}
				</>
			)
		}
	}
}