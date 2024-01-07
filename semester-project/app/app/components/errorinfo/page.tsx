import errorIcon from 'public/erroricon.png'
import './errorInfoStyle.css'

interface errorInfoProps {
    message: string
}

export default function ErrorInfo(props: errorInfoProps) {
    return (
        <div className="errorInfoContainer">
            <img className='errorImage' src={errorIcon.src} alt='greska'/>
            <p className='errorMessage'>{props.message}</p>
        </div>
    )
}