import Loader from '../loader/loader';
import './loadingStyle.css'

type loadingProps = {
	message: string;
	bold?:boolean;
	color?:string;
	width?:number
}

function Loading({message, bold, color, width=100}:loadingProps) {
	const style = {'color': color || '', 'fontWeight': bold ? 'bold' : 'normal'}
    return (
		<div className='loadingSpinnerContainer' style={{margin:'auto'}}>
			<Loader size={width}/>
			<p style={style} className='loadingMessage'>{message}</p>
		</div>
	)
}
export default Loading;