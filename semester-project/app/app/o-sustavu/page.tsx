import type { Metadata } from 'next'
import Header from '../components/header/page'
import Footer from '../components/footer/page'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import { Suspense } from 'react';
import Loading from '../components/Loading/page'
import ErrorInfo from '../components/errorinfo/page'
import {getSession} from '../lib/getSession'

export const metadata: Metadata = {
  title: 'O sustavu',
  description: 'Opće informacije o sustavu eKaštela',
}

const gqlAboutPageContent = `query aboutCollectionQuery {
  aboutCollection {
    items{
      sys {
      	id
    	}
    	imageurl, abouttext
    }
  }
}`

interface AboutPageContent {
  sys: {
    id: string;
  };
  abouttext: string,
  imageurl:string,
}

interface AboutCollectionResponse {
  aboutCollection: {
    items: AboutPageContent[];
  };
}

const BASE_URL=`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`

export const getAboutPageContent = async (): Promise<AboutPageContent[]> => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query: gqlAboutPageContent }),
    });
    if(response.ok) {
      const body = (await response.json()) as {
      data: AboutCollectionResponse;
      };
      
      const aboutPageContentToPublish: AboutPageContent[] = body.data.aboutCollection.items.map((item) => ({
        sys: {id: item.sys.id},
        abouttext: item.abouttext,
        imageurl: item.imageurl,
      }));
      return aboutPageContentToPublish
    }
    else return []
  } catch (error) {
    console.log(error);
    return []
  }
};

async function RenderAboutPageContent() {
  const response = await getAboutPageContent()
  return (
    <>
    {response.length ? 
      <>
        <img src={response[0].imageurl} alt='slika'/>
        <br/>
        <p>{response[0].abouttext}</p>
      </> :
      <ErrorInfo message='Dogodila se greška pri učitavanju stranice.'/>}
    </>
  )
}

async function AboutPage() {
  const session = await getSession()
  //if(!session) redirect('../prijava')
  return (
    <>
      <Header currentPage='O sustavu' session={session}/>
      <main className='prose lg:prose-xl'>
        <Suspense fallback={<Loading whatIsLoading='Podaci'/>}>
          <RenderAboutPageContent/>
        </Suspense>  
      </main>
      <Footer isLoggedIn={session ? true : false}/>
    </>
  )
}

  export default AboutPage;
  /*return (
      <>
        
        <div className="flex justify-center">
          <h2>Dobar dan, {session?.user.name} {session?.user.surname}</h2>
          <h1>Ovo je stranica s informacijama o sustavu, uslugama koje se nude i kako postati korisnik</h1>
          <Logout />
        </div>
      </>
    );*/