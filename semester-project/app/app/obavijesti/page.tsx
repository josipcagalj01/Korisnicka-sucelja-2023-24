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

export const metadata: Metadata = {
	title: 'Obavijesti',
	description: 'Stranica s obavijestima informacijskog sustava eKaštela',
}

var newsCategories = ['Sve obavijesti', 'Natječaji', 'Usluge', 'Servisne informacije']

async function Announcments({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {

	const { _limit, _page, _category } = searchParams;
	const [pageSize, page] = [_limit, _page].map(Number);
	const category = _category?.toString()
	const totalAnnouncments = await getTotalNewsCount({ category })
	const totalPages = Math.ceil(totalAnnouncments / pageSize);

	function PagesNavigation() {
		return (
			<div className="flex gap-4 pagesNavigation">
				<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: 1, _limit: pageSize, _category: _category?.toString() } }} className={`${page < 2 && 'disabled'} desktop`}>Prva</BorderedLink>
				<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: 1, _limit: pageSize, _category: _category?.toString() } }} className={`${page < 2 && 'disabled'} mobile`}>{`«`}</BorderedLink>
				<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: page - 1, _limit: pageSize, _category: _category?.toString() } }} className={`${page < 2 && 'disabled'} desktop`}>Prethodna</BorderedLink>
				<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: page - 1, _limit: pageSize, _category: _category?.toString() } }} className={`${page < 2 && 'disabled'} mobile`}>{`‹`}</BorderedLink>
				<span className='currentPageInfo'> Stranica <br className='mobile' />{page} od {totalPages} </span>
				<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: page + 1, _limit: pageSize, _category: _category?.toString() } }} className={`${(totalPages - page) < 1 && 'disabled'} desktop`}>Sljedeća</BorderedLink>
				<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: page + 1, _limit: pageSize, _category: _category?.toString() } }} className={`${(totalPages - page) < 1 && 'disabled'} mobile`}>{`›`}</BorderedLink>
				<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: totalPages, _limit: pageSize, _category: _category?.toString() } }} className={`${(totalPages - page) < 1 && 'disabled'} desktop`}>Posljednja</BorderedLink>
				<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: totalPages, _limit: pageSize, _category: _category?.toString() } }} className={`${(totalPages - page) < 1 && 'disabled'} mobile`}>{`»`}</BorderedLink>
			</div>
		)
	}

	if (page > totalPages) return (<main className='errorMain'><Error404 /></main>)
	return (
		<main>
			<h1>Obavijesti</h1>
			<div className='categoryMenuContainer'>
				{newsCategories.map((Category) => (
					<BorderedLink key={Category} className={Category === category?.replace('_', ' ') ? 'current' : Category === 'Sve obavijesti' && !category ? 'current' : ''} href={`/obavijesti?_page=1&_limit=10${Category === 'Sve obavijesti' ? '' : `&_category=${Category.replace(' ', '_')}`}`}>{Category}</BorderedLink>
				))}
			</div>
			{_limit && _page && <PagesNavigation />}
			<Suspense fallback={<Loading message='Učitavanje obavijesti ...' />}>
				<News offset={pageSize * (page - 1)} limit={pageSize} category={_category?.toString()} className='mobile-no-thumbnail' />
			</Suspense>
			{_limit && _page && <PagesNavigation />}
		</main>
	);
}
export default Announcments;