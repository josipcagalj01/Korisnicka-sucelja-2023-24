import { urlQuery } from "../pages-navigation/PagesNavigation";
import BorderedLink from "../BorderedLink/button";
import { getCategories } from "../../../lib/db_qurery_functions";
import { getAnnouncmentCategories } from "../../../lib/manage-announcments/db_queries";
import styles from './style.module.css'

export async function FormCategoryMenu({className='', basePath, query, current}: {className?:string, basePath:string, query: urlQuery, current?:number}) {
	const {_category, ...rest} = query
	const {categories} = await getCategories()
	return (
		<div className={styles.categoryMenuContainer + ' ' + className}>
			<BorderedLink className={styles.borderedLink + ' ' + (!current ? 'current' : '')} href={basePath + '?' + Object.entries(rest).map(([key, value])=>`${key}=${value}`).join('&')}>Svi obrasci</BorderedLink>
			{categories?.map(({id, name}) => (
				<BorderedLink key={name} className={styles.borderedLink + ' ' + (id === current ? 'current' : '')} href={basePath + '?' + Object.entries(rest).map(([key, value])=>`${key}=${value}`).join('&') + '&_category=' + id}>
					{name}
				</BorderedLink>
			))}
		</div>
	)
}

export async function NewsCategoryMenu({className='', basePath, query, current}: {className?:string, basePath:string, query: urlQuery, current?:number}) {
	const {_category, ...rest} = query
	const categories = await getAnnouncmentCategories()
	return (
		<div className={styles.categoryMenuContainer + ' ' + className}>
			<BorderedLink className={styles.borderedLink + ' ' + (!current ? 'current' : '')} href={basePath + '?' + Object.entries(rest).map(([key, value])=>`${key}=${value}`).join('&')}>Sve obavijesti</BorderedLink>
			{categories?.map(({id, name}) => (
				<BorderedLink key={name} className={styles.borderedLink + ' ' + (id === current ? 'current' : '')} href={basePath + '?' + Object.entries(rest).map(([key, value])=>`${key}=${value}`).join('&') + '&_category=' + id}>
					{name}
				</BorderedLink>
			))}
		</div>
	)
}