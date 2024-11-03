import { Suspense } from "react";
import Loading from "../Loading/loading";
import PagesNavigation, {urlQuery} from "../pages-navigation/PagesNavigation";
import { getMySubmissions, getMySubmissionsCount } from "../../../lib/db_qurery_functions";
import { Error404 } from "../error/errorXYZ";
import ActionResultInfo from "../actionResultInfo/actionResultInfo";
import submissionsStyle from '../../prijave/submissionsStyle.module.css'
import mySubmissionStyle from './mySubmissionsStyle.module.css'
import {FormCategoryMenu} from "../category-menu/categoryMenu";

export default function MySubmissions({searchParams}: { searchParams: Record<string, string | string[] | undefined>;}) {
	return (
		<>
			<Suspense fallback={<Loading message="Učitavanje Vaših prijava je u tijeku"/>}>
				<Render searchParams={searchParams} />
			</Suspense>
		</>
	)
}

async function Render({searchParams}: { searchParams: Record<string, string | string[] | undefined>;}) {
	const { _limit, _page, _category} = searchParams;
	const [pageSize, page, category] = [_limit, _page, _category].map(Number);
	if(_limit && isNaN(pageSize) || _page && isNaN(page) || _category && isNaN(category)) return (<Error404/>)
	else {
		const count = await getMySubmissionsCount(_category ? _category as string : undefined)
		const totalPages = (count || 0)>0 ? Math.ceil((count || 0) / (pageSize || 1)) : 1
		if(page>totalPages) return (<Error404/>)
		else {
			const submissions = await getMySubmissions((page-1)*pageSize, pageSize, _category ? _category as string : undefined)
			if(!submissions) return (<ActionResultInfo ok={false} message="Nije moguće učitati povijest Vaših zahtjeva."/>)
			else {
				const query : urlQuery = {
					...(page && !isNaN(page)) ? {'_page': page} : {},
					...(_limit && !isNaN(pageSize)) ? {'_limit': pageSize} : {},
					..._category ? {_category: _category as string} : {}
				}
				return (
					<>
						<h1 className={submissionsStyle.h1}>Moji zahtjevi</h1>
						<FormCategoryMenu basePath="/moj-racun/povijest-zahtjeva" query={query} current={_category ? category : undefined}/>
						{submissions?.length ?
							<>
								{!isNaN(pageSize) && !isNaN(page) && <PagesNavigation basePath={`moj-racun/povijest-zahtjeva`} page={page} totalPages={totalPages} otherParams={query}/>}
								<div className={mySubmissionStyle.mySubmissions}>
									{submissions.map((submission)=>
										<div key={submission.id} className={mySubmissionStyle.card}>
											<div>
												<p>Naziv obrasca</p>
												<b>{submission.form.title}</b>
											</div>
											<div>
												<p>Datum i vrijeme</p>
												<b>{submission.time.toLocaleString('hr-hr', {timeZone: 'Europe/Zagreb', dateStyle:'full', timeStyle:'medium'})}</b>
											</div>
											<div>
												<p>Kategorija obrasca</p>
												<b>{submission.form.category.name}</b>
											</div>
										</div>
									)}
								</div>
								{!isNaN(pageSize) && !isNaN(page) && <PagesNavigation basePath={`moj-racun/povijest-zahtjeva`} page={page} totalPages={totalPages} otherParams={query}/>}
							</> 
							: <h3 className={submissionsStyle.centerHorizontally}>Nema zahtjeva za prikazati</h3>
						}
					</>
				)
			}
		}
	}	
}