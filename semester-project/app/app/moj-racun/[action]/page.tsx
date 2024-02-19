import { Metadata } from "next"
import {Error404 } from "../../components/error/errorXYZ"
import Loading from "../../components/Loading/loading"
import dynamic from "next/dynamic"

interface params {
    action:string
}

export var actions = [
    {parameter:'promjena-lozinke', text:'Promjeni lozinku', formName:'changePasswordForm', actionThumbnail:'/password.png'},
    {parameter: 'promjena-e-poste', text:'Promjeni adresu e-pošte', formName:'changeEmailForm', actionThumbnail:'/big_mail_image.png'},
    {parameter:'promjena-korisnickog-imena', text:'Promjeni korisničko ime', formName:'changeUsernameForm', actionThumbnail:'/pngwing.com.png'},
    {parameter: 'brisanje-korisnickog-racuna', text:' Brisanje korisničkog računa', formName:'deleteAccountForm', actionThumbnail:'/trashcan.png'}
]

export const generateMetadata = async ({ params }: {params: params}) : Promise<Metadata> => {

    let title='Greška'
    actions.map(
        (item)=>{
            if(params.action===item.parameter) {
                title=item.text
                return
            }
        }
    )
    return {title:title}
  }

export default function SwitchAction({params}:{params:params}) {
    let ComponentToRender:any = Error404
    actions.map(
        (item)=> {
            if(item.parameter===params.action) {
                ComponentToRender=dynamic(()=>import(`../../components/${item.formName}`), {ssr:false, loading: ()=><Loading message="Učitavanje"/>})
                return
            }
        }
    )
    return (<ComponentToRender/>)
}