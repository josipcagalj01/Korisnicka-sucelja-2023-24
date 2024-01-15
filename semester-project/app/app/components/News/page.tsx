import Link from 'next/link'
import * as React from 'react';
import ErrorInfo from '../errorinfo/page';
import { Suspense } from 'react';
import Loading from '../Loading/page'
import './newsStyle.css'

interface newsProps {
  offset: number,
  limit: number
  desiredId:number | undefined
}

const gqlNewsSection = `query newsCollectionQuery {
    newsCollection {
      items {
        sys {
          id
        }
        id,title,body,imageurl,imagetitle
      }
    }
  }`;
  
interface NewstCollectionResponse {
    newsCollection: {
      items: News[];
    };
}
  
  interface News {
    sys: {
      id: string;
    };
    id: number,
    title: string,
    body: string,
    imageurl:string,
    imagetitle: string
}

interface newsPackage {
  count: number,
  news: News[]
}

const BASE_URL=`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`

export const getNews = async (params:newsProps): Promise<newsPackage> => {

  const query = `query newsCollectionQuery {
    newsCollection ${ params.offset>0 || params.limit>0 || params.desiredId != undefined ? `(${params.offset>0 ? `skip:${params.offset} ` : ""}${params.limit>0 ? `limit:${params.limit}` : ''} ${params.desiredId!=undefined &&params.desiredId>0  ? `where: {id:${params.desiredId}}` : ""})` : ''} {
      items {
        sys {
          id
        }
        id,title,body,imageurl,imagetitle
      }
    }
  }`
  
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query: query }),
    });
    if(response.ok) {
      const body = (await response.json()) as {
      data: NewstCollectionResponse;
      };
      
      const newsToPublish: News[] = body.data.newsCollection.items.map((item) => ({
        sys: {id: item.sys.id},
        id: item.id,
        title: item.title,
        body: item.body,
        imageurl: item.imageurl,
        imagetitle: item.imagetitle,
      }));
      return {count: newsToPublish.length, news: newsToPublish};
    }
    else return {count: -1, news: []}
  } catch (error) {
    console.log(error);
    return {count: -1, news: []}
  }
};

export default async function News(props:newsProps) {
  const data = await getNews(props)
  if(data.count===-1) return (
    <>
      <ErrorInfo message='Dogodila se greška pri učitavanju obavijesti.'/>
    </>)
  else if (data.count===0) return (<p>Nema novih obavijesti</p>)
  else return (
    <>
      <Suspense fallback={<Loading message='Obavijesti se učitavaju' bold={false} color='black'/>}>
        <div className='AnnouncmentsContainer'>
          {data.news.map((announcment) => (
            <article className='announcment' key={announcment.id}>
              <img className='announcmentImage' src={announcment.imageurl} alt={announcment.imagetitle} />
              <Link href={'/obavijesti/' + announcment.id}>
                <h3 className='announcmentTitle'>{announcment.title}</h3>
              </Link>
              <p className='announcmentText'> {announcment.body.substring(0, 200)}</p>
            </article>))}
        </div>
      </Suspense>
    </>
		
	)
}



