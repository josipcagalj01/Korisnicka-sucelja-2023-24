import BorderedLink from "../BorderedLink/button"
import styles from './pagesNavigationStyle.module.css'
import Image from "next/image"

export interface urlQuery {[key:string]: string | number | undefined}

export interface pagesNavigationProps {
	className?:string
	basePath:string, page:number,
	totalPages:number,
	otherParams?: urlQuery}

export default function PagesNavigation({className='', basePath, page, totalPages, otherParams} : pagesNavigationProps) {
	const {_page, ...rest} = otherParams || {_page: undefined}
	return (
		<div className={"flex gap-4 " + styles.pagesNavigation + ' ' + className}>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: 1, ...rest} }} className={`${page < 2 && styles.disabled} ${styles.desktop}`}>
				Prva
			</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: 1, ...rest} }} className={`${page < 2 && styles.disabled} ${styles.mobile} ${styles.back}`}>
				<Image alt='show-hide-arrow-double.png' src='/arrows/show-hide-arrow-double.png' height={13} width={13}/>
			</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: page-1, ...rest} }} className={`${page < 2 && styles.disabled} ${styles.desktop}`}>
				Prethodna
			</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: page-1, ...rest} }} className={`${page < 2 && styles.disabled} ${styles.mobile}  ${styles.back}`}>
				<Image alt='show-hide-arrow.png' src='/arrows/show-hide-arrow.png' height={14} width={8}/>
			</BorderedLink>
			<span className='currentPageInfo'> Stranica <br className='mobile'/>{page} od {totalPages} </span>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: page+1, ...rest} }} className={`${(totalPages - page) < 1 && styles.disabled} ${styles.desktop}`}>
				Sljedeća
			</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: page+1, ...rest} }} className={`${(totalPages - page) < 1 && styles.disabled} ${styles.mobile}`}>
				<Image alt='show-hide-arrow.png' src='/arrows/show-hide-arrow.png' height={14} width={8}/>
			</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: totalPages, ...rest} }} className={`${(totalPages - page) < 1 && styles.disabled} ${styles.desktop}`}>
				Posljednja
			</BorderedLink>
			<BorderedLink href={{ pathname: `/${basePath}`, query: { _page: totalPages, ...rest} }} className={`${(totalPages - page) < 1 && styles.disabled} ${styles.mobile}`}>
				<Image alt='show-hide-arrow-double.png' src='/arrows/show-hide-arrow-double.png' height={13} width={13}/>
			</BorderedLink>
		</div>
	)
}