import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import {Error404} from '../components/error/errorXYZ'
import '../obavijesti/[announcmentId]/newsPageStyle.css'
import { getTotalCount } from '../../lib/db_qurery_functions';
import { Suspense } from 'react';
import Loading from '../components/Loading/loading'
import FormsList from '../components/FormsList';
import { LoginRequired } from '../components/wrappers';
import PagesNavigation, {urlQuery} from '../components/pages-navigation/PagesNavigation';
import { FormCategoryMenu } from '../components/category-menu/categoryMenu';

export const metadata: Metadata = {
  title: 'Usluge',
  description: 'Usluge',
}

async function Services({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {

	const { _limit, _page, _category } = searchParams;
	const [pageSize, page, category] = [_limit, _page, _category].map(Number);
	
	let formsCount : number = 0
	let where : any = {avalible_from: {lte: new Date(Date.now())}, OR: [ {avalible_until: null}, {avalible_until:{gte: new Date(Date.now())}} ], sketch: false}
	
	formsCount = await getTotalCount({tableName:'form', condition: {where: where}})
	let totalPages = 1 
	if(formsCount>0) totalPages = Math.ceil(formsCount / pageSize)
	const query : urlQuery = {'_limit': pageSize, '_category': category}
	if(_page && !_limit || _limit && !page) return (<main className='errorMain'><Error404/></main>)
	else if(_page && isNaN(page) || _limit && isNaN(pageSize) || _category &&  isNaN(category)) return (<main className='errorMain'><Error404/></main>)
	else if(page>totalPages) return (<main className='errorMain'><Error404/></main>)
	return (
			<main>
				<LoginRequired>
					<h1 className='serviceTitle'>Usluge</h1>
					<FormCategoryMenu className='categoryMenuContainer' basePath='/usluge' query={{...(_page && !isNaN(page) ? {_page: page} : {}), ...query}} current={_category && !isNaN(category) ? category : undefined}/>
					{_limit && _page && formsCount>0 && <PagesNavigation basePath='usluge' page={page} totalPages={totalPages} otherParams={query}/>}
					<Suspense fallback={<Loading message='Učitavanje ugluga...'/>}>
						<FormsList offset={pageSize * (page - 1)} limit={pageSize} category={category} className='mobile-no-thumbnail'/>
					</Suspense>
					{_limit && _page && formsCount>0 && <PagesNavigation basePath='usluge' page={page} totalPages={totalPages} otherParams={query}/>}
				</LoginRequired>
			</main>
	);
}
export default Services;