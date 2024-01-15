import spinner from 'public/spinner.gif'
import './loadingStyle.css'

/*interface loadingProps {
	message: string,
	bold:boolean,
	color:string
}*/

export default function Loading () {
	//const style = {color: color, 'fontWeight':`${bold ? 'bold' : 'normal'}`}
    return (
		<div className='loadingSpinnerContainer'>
			<img src={spinner.src} className='spinner'alt='ucitavanje'/>
			<p  className='loadingMessage'>Poruka</p>
		</div>
	)
}