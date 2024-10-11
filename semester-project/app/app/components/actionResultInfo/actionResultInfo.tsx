import './errorInfoStyle.css'
import Image from 'next/image'
interface errorInfoProps {
    ok?:boolean
    message: string,
    className?: string
}

export default function ActionResultInfo({ok=false, message, className}: errorInfoProps) {
    let imageSrc='/erroricon.png'
    if(ok) imageSrc='/ok-icon.png'
    return (
        <div className={"actionResultInfoInfoContainer " + className}>
            <Image className='actionResultInfoImage' src={imageSrc} width={80} height={80} alt='greska'/>
            <p className='actionResultInfoMessage'>{message}</p>
        </div>
    )
}