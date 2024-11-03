import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import {Error404} from '../components/error/errorXYZ'
import '../obavijesti/[announcmentId]/newsPageStyle.css'
import { getFormsCountForEmployees } from '../../lib/db_qurery_functions';
import { Suspense } from 'react';
import Loading from '../components/Loading/loading'
import BorderedLink from '../components/BorderedLink/button'
import {FormsList2} from '../components/FormsList';
import { EmployeesOnly } from '../components/wrappers';
import PagesNavigation, {urlQuery} from '../components/pages-navigation/PagesNavigation';
import styles from './editableFormsStyle.module.css'
import {FormCategoryMenu} from '../components/category-menu/categoryMenu';

export const metadata: Metadata = {
  title: 'Pregled obrazaca',
}

async function Services({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {

	const { _limit, _page, _category } = searchParams;
	const [pageSize, page, category] = [_limit, _page, _category].map(Number);
	
	const formsCount : number = await getFormsCountForEmployees({condition: {category: {id:	!isNaN(category) ? category : undefined}}})

	let totalPages = 1 
	if(formsCount>0) totalPages = Math.ceil(formsCount / pageSize)

	const query : urlQuery = {'_limit': pageSize, '_category': category}

	if((_page && isNaN(page) || _limit && isNaN(pageSize)) || _category && isNaN(category) || page>totalPages) return (<main className='errorMain'><Error404/></main>)
	return (
			<main>
				<EmployeesOnly>
					<h1 className='serviceTitle'>Pregled obrazaca</h1>
					<FormCategoryMenu className='categoryMenuContainer' basePath='/obrasci' query={{...(_page && !isNaN(page) ? {_page: page} : {}), ...query}} current={_category && !isNaN(category) ? category : undefined}/>
					<BorderedLink href='/obrasci/dodaj-novi-obrazac' className={styles.addFormLink}>Dodaj novi obrazac</BorderedLink>
					{_limit && _page && formsCount>0 && <PagesNavigation basePath='obrasci' page={page} totalPages={totalPages} otherParams={query}/>}
					<Suspense fallback={<Loading message='Učitavanje ugluga...'/>}>
						<FormsList2 offset={pageSize * (page - 1)} limit={pageSize} category={category} className='mobile-no-thumbnail'/>
					</Suspense>
					{_limit && _page && formsCount>0 && <PagesNavigation basePath='obrasci' page={page} totalPages={totalPages} otherParams={query}/>}
				</EmployeesOnly>
			</main>
	);
}
export default Services;