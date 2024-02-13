import { Metadata } from "next"
import {Error404 } from "../../components/error/errorXYZ"
import Loading from "../../components/Loading/loading"
import dynamic from "next/dynamic"

interface params {
    action:string
}

var actions = [
    {parameter:'promjena-lozinke', text:'Promjena lozinke', formName:'changePasswordForm'},
    {parameter:'promjena-korisnickog-imena', text:'Promjena korisničkog imena', formName:'changeUsernameForm'},
    {parameter: 'promjena-e-poste', text:'Promjena adrese e-pošte', formName:'changeEmailForm'}
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