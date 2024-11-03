import { Metadata } from 'next'
import { Error404 } from "../../components/error/errorXYZ";
import { getFormConfiguration, getRate } from "../../../lib/db_qurery_functions";
import Loading from "../../components/Loading/loading";
import { Suspense } from "react";
import {LoginRequired} from "../../components/wrappers";
import './servicePageStyle.css'
import DynamicForm from '../../components/renderForm'
import { serviceParams } from "../../api/usluge/[serviceId]/route";

export const revalidate = 0

export const generateMetadata = async ({ params }: { params: serviceParams }): Promise<Metadata> => {
	const id = parseInt(params.serviceId)
	if (Number.isNaN(id)) return { title: 'Greška' }
	const Form = await getFormConfiguration(id);
	if (!Form) return { title: 'Greška' }
	else return { title: Form.title }
}

export default function Service({ params }: { params: serviceParams }) {
	const isNaN = Number.isNaN(Number.parseInt(params.serviceId))
	return (
		<main className="_80ch formMain">
			<LoginRequired>
				{isNaN && <Error404/>}
				{!isNaN && <Suspense fallback={<Loading message="Učitavanje obrasca..."/>}>
					<RenderForm params={params}/>
				</Suspense>}
			</LoginRequired>
		</main>
	)
}

async function RenderForm({ params }: { params: serviceParams }) {
	const formId = Number.parseInt(params.serviceId)
	const Form = await getFormConfiguration(formId)
	if(!Form) return <Error404/>
	else {
		const rate = await getRate(formId)
		const now = new Date(Date.now())
		return (
		<>
			<h1 className="serviceTitle">{Form.title}</h1>
			<p className='date&category'>{Form.avalible_from?.toLocaleDateString('hr-HR', {timeZone: 'Europe/Zagreb'})} | {Form.category.name}</p>
			<DynamicForm now={now} Form={Form} rate={rate}/>
		</>
	)}
}