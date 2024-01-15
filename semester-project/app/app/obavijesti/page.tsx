import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import Header from '../components/header/page'
import Footer from '../components/footer/page'
import { getSession } from '../../lib/getSession'
import './[announcmentId]/newsPageStyle.css'
import News from '../components/News/page'
import { getTotalNewsCount } from '../../lib/contentfulClient'
import { Suspense } from 'react';
import Loading from '../components/Loading/page'
import BorderedLink from '../components/BorderedLink/page'

export const metadata: Metadata = {
  title: 'Obavijesti',
  description: 'Stranica s obavijestima informacijskog sustava eKaštela',
}

async function Announcments({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {
	const session = await getSession()

	const { _limit, _page } = searchParams;
	const [pageSize, page] = [_limit, _page].map(Number);
	const totalAnnouncments = await getTotalNewsCount()
	const totalPages = Math.ceil(totalAnnouncments / pageSize);


	return (
		<>
			<main>
				<h1>Obavijesti</h1>
				<Suspense fallback={<Loading/>}>
					<News offset={pageSize * (page - 1)} limit={pageSize} desiredId={undefined} />
				</Suspense>
				{_limit && _page && (
					<div className="flex gap-4 pagesNavigation">
						<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: 1, _limit: pageSize } }} className={`${page < 2 && 'disabled'} desktop`}>Prva</BorderedLink>
						<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: 1, _limit: pageSize } }} className={`${page < 2 && 'disabled'} mobile`}>{`<<`}</BorderedLink>
						<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: page-1, _limit: pageSize } }} className={`${page < 2 && 'disabled'} desktop`}>Prethodna</BorderedLink>
						<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: page-1, _limit: pageSize } }} className={`${page < 2 && 'disabled'} mobile`}>{`<`}</BorderedLink>
						<span> Stranica {page} od {totalPages} </span>
						<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: page+1, _limit: pageSize } }} className={`${(totalPages - page) < 1 && 'disabled'} desktop`}>Sljedeća</BorderedLink>
						<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: page+1, _limit: pageSize } }} className={`${(totalPages - page) < 1 && 'disabled'} mobile`}>{`>`}</BorderedLink>
						<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: totalPages, _limit: pageSize } }} className={`${(totalPages - page) < 1 && 'disabled'} desktop`}>Posljednja</BorderedLink>
						<BorderedLink href={{ pathname: `/obavijesti`, query: { _page: totalPages, _limit: pageSize } }} className={`${(totalPages - page) < 1 && 'disabled'} mobile`}>{`>>`}</BorderedLink>
					</div>)}
			</main>
			
		</>
	);
}
export default Announcments;