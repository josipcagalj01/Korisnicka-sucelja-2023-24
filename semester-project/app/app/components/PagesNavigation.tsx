import BorderedLink from "./BorderedLink/button"

export interface urlQuery {[key:string]: string | number | undefined}

export interface pagesNavigationProps {
	basePath:string, page:number,
	totalPages:number,
	otherParams?: urlQuery}

export default function PagesNavigation({basePath, page, totalPages, otherParams} : pagesNavigationProps) {
	return (
		<div className="flex gap-4 pagesNavigation">
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: 1, ...otherParams} }} className={`${page < 2 && 'disabled'} desktop`}>Prva</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: 1, ...otherParams} }} className={`${page < 2 && 'disabled'} mobile`}>{`«`}</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: page-1, ...otherParams} }} className={`${page < 2 && 'disabled'} desktop`}>Prethodna</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: page-1, ...otherParams} }} className={`${page < 2 && 'disabled'} mobile`}>{`‹`}</BorderedLink>
			<span className='currentPageInfo'> Stranica <br className='mobile'/>{page} od {totalPages} </span>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: page+1, ...otherParams} }} className={`${(totalPages - page) < 1 && 'disabled'} desktop`}>Sljedeća</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: page+1, ...otherParams} }} className={`${(totalPages - page) < 1 && 'disabled'} mobile`}>{`›`}</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: totalPages, ...otherParams} }} className={`${(totalPages - page) < 1 && 'disabled'} desktop`}>Posljednja</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: totalPages, ...otherParams} }} className={`${(totalPages - page) < 1 && 'disabled'} mobile`}>{`»`}</BorderedLink>
		</div>
	)
}