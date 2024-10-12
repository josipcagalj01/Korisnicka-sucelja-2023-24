import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import {Error404} from '../components/error/errorXYZ'
import '../obavijesti/[announcmentId]/newsPageStyle.css'
import { getCategories, Category, getFormsCountForEmployees } from '../../lib/db_qurery_functions';
import { Suspense } from 'react';
import Loading from '../components/Loading/loading'
import BorderedLink from '../components/BorderedLink/button'
import {FormsList2} from '../components/FormsList';
import { EmployeesOnly } from '../components/wrappers';
import PagesNavigation, {urlQuery} from '../components/pages-navigation/PagesNavigation';
import styles from './editableFormsStyle.module.css'

export const metadata: Metadata = {
  title: 'Pregled obrazaca',
}

async function Services({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {

	const { _limit, _page, _category } = searchParams;
	const [pageSize, page] = [_limit, _page].map(Number);

	const {categories} = await getCategories()
	
	let formsCount : number = 0
	let categoryExists : Category| undefined | boolean = true
	const category = _category?.toString().replace('_', ' ')
	if(category) {
		categoryExists = categories?.find((categoryFromArray)=>categoryFromArray.name===category)
		formsCount = await getFormsCountForEmployees({condition: {category_id:	categoryExists?.id}})
	}
	else formsCount = await getFormsCountForEmployees()

	let totalPages = 1 
	if(formsCount>0) totalPages = Math.ceil(formsCount / pageSize)

	const query : urlQuery = {'_limit': pageSize, '_category': category}

	if((isNaN(page) || isNaN(pageSize)) || (!categoryExists || page>totalPages)) return (<main className='errorMain'><Error404/></main>)
	return (
			<main>
				<EmployeesOnly>
					<h1 className='serviceTitle'>Pregled obrazaca</h1>
					<div className='categoryMenuContainer'>
						<BorderedLink className={!category ? 'current' : ''} href='/obrasci?_page=1&_limit=15'>Svi obrasci</BorderedLink>
						{categories?.map(({id, name}) => (
							<BorderedLink key={name} className={name === category ? 'current' : ''} href={`/obrasci?_page=1&_limit=15&_category=${name.replace(' ', '_')}`}>
								{name}
							</BorderedLink>
						))}
					</div>
					<BorderedLink href='/obrasci/dodaj-novi-obrazac' className={styles.addFormLink}>Dodaj novi obrazac</BorderedLink>
					{_limit && _page && formsCount>0 && <PagesNavigation basePath='usluge' page={page} totalPages={totalPages} otherParams={query}/>}
					<Suspense fallback={<Loading message='Učitavanje ugluga...'/>}>
						<FormsList2 offset={pageSize * (page - 1)} limit={pageSize} category={category} className='mobile-no-thumbnail'/>
					</Suspense>
					{_limit && _page && formsCount>0 && <PagesNavigation basePath='usluge' page={page} totalPages={totalPages} otherParams={query}/>}
				</EmployeesOnly>
			</main>
	);
}
export default Services;