import PagesNavigation, {urlQuery} from "../components/pages-navigation/PagesNavigation"
import { Metadata } from "next"
import { EmployeesOnly } from "../components/wrappers";
import { getFormsCountForEmployees } from "../../lib/db_qurery_functions";
import { Suspense } from "react";
import Loading from "../components/Loading/loading";
import '../obavijesti/[announcmentId]/newsPageStyle.css'
import { FormsList3 } from "../components/FormsList";
import { FormCategoryMenu } from "../components/category-menu/categoryMenu";

export const metadata : Metadata = {
	title: 'Prijave'
}

export default async function SubmittedForms({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {

	return (
		<main>
			<EmployeesOnly>
				<h1>Prijave</h1>
				<Suspense fallback={<Loading message="Obrasci se učitavaju..."/>}>
					<Render searchParams={searchParams} />
				</Suspense>
			</EmployeesOnly>
		</main>
	)
}

async function Render({ searchParams }: { searchParams: Record<string, string | string[] | undefined>; }) {
	const { _limit, _page, _category, _department } = searchParams;
	const [pageSize, page, department, category] = [_limit, _page, _department, _category].map(Number);

	let formsCount : number = await getFormsCountForEmployees({condition: {category: _category && !isNaN(category) ? {id: category} : undefined}})

	let totalPages = 1 
	if(formsCount>0 && !isNaN(pageSize)) totalPages = Math.ceil(formsCount / pageSize)

	let query : urlQuery = {}
	if(!isNaN(pageSize)) query['_limit'] = pageSize
	if(category) query['_category'] = category
	if(!isNaN(department)) query['_department'] = department
	return(
		<>
			<FormCategoryMenu className="categoryMenuContainer" basePath="/prijave" current={_category && !isNaN(category) ? category : undefined} query={{...(_page && !isNaN(page) ? {_page:page} : {}), ...query}}/>
			{!isNaN(pageSize) && !isNaN(page) && formsCount>0 && <PagesNavigation basePath='prijave' page={page} totalPages={totalPages} otherParams={query}/>}
			<FormsList3 limit={pageSize} offset={pageSize * (page - 1)} category={category}/>
			{!isNaN(pageSize) && !isNaN(page) && formsCount>0 && <PagesNavigation basePath='prijave' page={page} totalPages={totalPages} otherParams={query}/>}
		</>
	)
}