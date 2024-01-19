import errorIcon from 'public/erroricon.png'
import './errorInfoStyle.css'
import Image from 'next/image'
interface errorInfoProps {
    message: string
}

export default function ErrorInfo(props: errorInfoProps) {
    return (
        <div className="errorInfoContainer">
            <Image className='errorImage' src={errorIcon.src} width={errorIcon.width} height={errorIcon.height} alt='greska'/>
            <p className='errorMessage'>{props.message}</p>
        </div>
    )
}