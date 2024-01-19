import Image from 'next/image';
import spinner from 'public/spinner.gif'
import './loadingStyle.css'

type loadingProps = {
	message: string;
	bold?:boolean;
	color?:string;
	height?:number,
	width?:number
}

function Loading({message, bold=false, color='', height=100, width=100}:loadingProps) {
	const style = {'color': color ?? '', 'fontWeight': bold ? 'bold' : 'normal'}
    return (
		<div className='loadingSpinnerContainer' style={{margin:'auto'}}>
			<Image src={spinner.src} alt='ucitavanje' width={width} height={height} style={{margin:'auto'}}/>
			<p  style={style} className='loadingMessage'>{message ?? 'a'}</p>
		</div>
	)
}
export default Loading;