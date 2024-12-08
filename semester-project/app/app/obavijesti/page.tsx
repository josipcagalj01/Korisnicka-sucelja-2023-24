import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import { Error404 } from '../components/error/errorXYZ'
import './[announcmentId]/newsPageStyle.css'
import News from '../components/News/news'
import { getAnnoumcmentsCount } from '../../lib/manage-announcments/db_queries'
import { Suspense } from 'react';
import Loading from '../components/Loading/loading'
import PagesNavigation from '../components/pages-navigation/PagesNavigation'
import { NewsCategoryMenu } from '../components/category-menu/categoryMenu'

export const metadata: Metadata = {
	title: 'Obavijesti',
	description: 'Stranica s obavijestima informacijskog sustava eKaštela',
}

async function Announcments({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {

	const { _limit, _page, _category } = searchParams;
	const [pageSize, page, categoryId] = [_limit, _page, _category].map(Number);

	const totalAnnouncments = await getAnnoumcmentsCount({categoryId: _category ? categoryId : undefined})
	const totalPages = totalAnnouncments>0 ? Math.ceil(totalAnnouncments / pageSize) : 1;

	const query = {'_limit': pageSize, '_category': categoryId}

	if (page > totalPages) return (<main className='errorMain'><Error404 /></main>)
	return (
		<main>
			<h1>Obavijesti</h1>
			<NewsCategoryMenu className='categoryMenuContainer' basePath='/obavijesti' query={{...(_page && !isNaN(page) ? {_page: page} : {}), ...query}} current={_category ? categoryId : undefined}/>
			{_limit && _page && <PagesNavigation basePath='obavijesti' page={page} totalPages={totalPages} otherParams={query}/>}
			<Suspense fallback={<Loading message='Učitavanje obavijesti ...' />}>
				<News offset={pageSize * (page - 1)} limit={pageSize} category={_category ? categoryId : undefined} className='mobile-no-thumbnail' />
			</Suspense>
			{_limit && _page && <PagesNavigation basePath='obavijesti' page={page} totalPages={totalPages} otherParams={query}/>}
		</main>
	);
}
export default Announcments;