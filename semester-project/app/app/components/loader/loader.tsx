import { CSSProperties } from 'react'
import './loaderStyle.css'

export default function Loader({size, background = 'light'}: {size?:number, background?: 'light' | 'dark'}) {
	let style : CSSProperties | undefined
	if(background==='dark') style = {...style, ...{filter: 'Invert(1)'}}
	if(size) style = {...style, ...{width: size}}
	return (<div className='loader' style={style}></div>)
}