import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import { Error404 } from '../components/error/errorXYZ'
import './[announcmentId]/newsPageStyle.css'
import News from '../components/News/news'
import { getTotalNewsCount } from '../../lib/contentfulClient'
import { Suspense } from 'react';
import Loading from '../components/Loading/loading'
import BorderedLink from '../components/BorderedLink/button'
import PagesNavigation from '../components/pages-navigation/PagesNavigation'

export const metadata: Metadata = {
	title: 'Obavijesti',
	description: 'Stranica s obavijestima informacijskog sustava eKaštela',
}

var newsCategories = ['Natječaji', 'Usluge', 'Servisne informacije']

async function Announcments({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {

	const { _limit, _page, _category } = searchParams;
	const [pageSize, page] = [_limit, _page].map(Number);
	const category = _category?.toString()
	const totalAnnouncments = await getTotalNewsCount({ category })
	const totalPages = Math.ceil(totalAnnouncments / pageSize);

	const query = {'_limit': pageSize, '_category': category}

	if (page > totalPages) return (<main className='errorMain'><Error404 /></main>)
	return (
		<main>
			<h1>Obavijesti</h1>
			<div className='categoryMenuContainer'>
				<BorderedLink key='Sve obavijesti' className={!category ? 'current' : ''} href='/obavijesti?_page=1&_limit=10'>Sve obavijesti</BorderedLink>
				{newsCategories.map((Category) => (
					<BorderedLink key={Category} className={Category === category?.replace('_', ' ') ? 'current' : ''} href={`/obavijesti?_page=1&_limit=10${Category === 'Sve obavijesti' ? '' : `&_category=${Category.replace(' ', '_')}`}`}>{Category}</BorderedLink>
				))}
			</div>
			{_limit && _page && <PagesNavigation basePath='obavijesti' page={page} totalPages={totalPages} otherParams={query}/>}
			<Suspense fallback={<Loading message='Učitavanje obavijesti ...' />}>
				<News offset={pageSize * (page - 1)} limit={pageSize} category={_category?.toString()} className='mobile-no-thumbnail' />
			</Suspense>
			{_limit && _page && <PagesNavigation basePath='obavijesti' page={page} totalPages={totalPages} otherParams={query}/>}
		</main>
	);
}
export default Announcments;