import type { Metadata } from "next";
import {Error404} from '../components/error/errorXYZ'
import '../obavijesti/[announcmentId]/newsPageStyle.css'
import { Suspense } from 'react';
import Loading from '../components/Loading/loading'
import BorderedLink from '../components/BorderedLink/button'
import { EmployeesOnly } from '../components/wrappers';
import PagesNavigation, {urlQuery} from '../components/pages-navigation/PagesNavigation';
import styles from '../obrasci/editableFormsStyle.module.css'
import {NewsCategoryMenu} from '../components/category-menu/categoryMenu';
import { getAnnoumcmentsCount } from "../../lib/manage-announcments/db_queries";
import ActionResultInfo from "../components/actionResultInfo/actionResultInfo";
import News from "../components/News/news";

export const metadata: Metadata = {
	title: 'Objave'
}

export default async function ManageAnnouncments({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {
	const { _limit, _page, _category } = searchParams;
	const [pageSize, page, category] = [_limit, _page, _category].map(Number);

	const annoucmentsCount = await getAnnoumcmentsCount({categoryId: _category ? category : undefined})
	const totalPages = annoucmentsCount> 0 ? Math.ceil(annoucmentsCount / pageSize) :  1
	
	if((_page && isNaN(page) || _limit && isNaN(pageSize)) || _category && isNaN(category) || page>totalPages) return (<main className='errorMain'><Error404/></main>)
	else {	
		if(annoucmentsCount===-1) return (
			<main>
				<EmployeesOnly>
					<ActionResultInfo ok={false} message="Dogodio se problem pri učitavanju obavijesti."/>
				</EmployeesOnly>
			</main>
		)
		else {
			const query : urlQuery = {'_limit': pageSize, '_category': category}

			return (
				<main>
					<EmployeesOnly>
						<h1 className='serviceTitle'>Pregled objava</h1>
						<NewsCategoryMenu className='categoryMenuContainer' basePath='/objave' query={{...(_page && !isNaN(page) ? {_page: page} : {}), ...query}} current={_category && !isNaN(category) ? category : undefined}/>
						<BorderedLink href='/objave/dodaj-novu-objavu' className={styles.addFormLink}>Napiši novu objavu</BorderedLink>
						{_limit && _page && annoucmentsCount>0 && <PagesNavigation basePath='objave' page={page} totalPages={totalPages} otherParams={query}/>}
						<Suspense fallback={<Loading message='Učitavanje objava...'/>}>
							<News forEmployees={true} limit={_limit ? pageSize : undefined} offset={_page ? page-1 : undefined} category={_category ? category : undefined} />
						</Suspense>
						{_limit && _page && annoucmentsCount>0 && <PagesNavigation basePath='objave' page={page} totalPages={totalPages} otherParams={query}/>}
					</EmployeesOnly>
				</main>
			)
		}
	}
}