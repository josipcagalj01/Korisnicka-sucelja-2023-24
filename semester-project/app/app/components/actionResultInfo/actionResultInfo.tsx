import './errorInfoStyle.css'
import Image from 'next/image'
interface errorInfoProps {
    ok?:boolean
    message: string
}

export default function ActionResultInfo({ok=false, message}: errorInfoProps) {
    let imageSrc='/erroricon.png'
    if(ok) imageSrc='/ok-icon.png'
    return (
        <div className="actionResultInfoInfoContainer">
            <Image className='actionResultInfoImage' src={imageSrc} width={80} height={80} alt='greska'/>
            <p className='actionResultInfoMessage'>{message}</p>
        </div>
    )
}