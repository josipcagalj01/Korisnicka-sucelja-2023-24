const BASE_URL=`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`

export interface newsProps {
  offset?: number,
  limit?: number,
  desiredId?:number | undefined,
  category?:string | undefined
}
  
  interface NewstCollectionResponse {
    newsCollection: {
      items: News[];
    };
  }
  
export interface News {
    sys: {
      id: string;
    };
    id: number,
    title: string,
    date:string,
    category:string,
    body: string,
    image: {
      url:string,
      title:string
    }
}

export interface newsPackage {
    count: number,
    news: News[]
}



export const getNews = async ({offset=0,limit=0,desiredId=undefined,category=undefined}:newsProps): Promise<newsPackage> => {
  const query = `query newsCollectionQuery {
    newsCollection (order:date_DESC ${offset>0 ? `skip:${offset} ` : ""} ${limit>0 ? `limit:${limit}` : ''} ${desiredId || category ? `where: {${desiredId ? `id:${desiredId}`:''} ${category ? `category:"${category}"`:''}}` : ''}) {
      items {
        sys {
          id
        }
        id,
        title,
        date,
        category,
        body,
        image {
          url
          title
        }
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
          date: `${item.date.split('T')[0].split('-')[2]}.${item.date.split('T')[0].split('-')[1]}.${item.date.split('T')[0].split('-')[0]}.`,
          category:item.category,
          body: item.body,
          image: item.image
        }));
        return {count: newsToPublish.length, news: newsToPublish};
      }
      else return {count: -1, news: []}
    } catch (error) {
      console.log(error);
      return {count: -1, news: []}
    }
  };

interface newsTotalCountResponse {
  newsCollection: {
    total:number
  }
}

export async function getTotalNewsCount({category}:{category:string | undefined}):Promise<number> {

  const query = `query getTotalNewsCountQuery {
    newsCollection ${category ? `(where:{category:"${category}"})` :''} {
      total
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
      data: newsTotalCountResponse;
      };
      return body.data.newsCollection.total;
    }
    else return -1
  } catch (error) {
    console.log(error);
    return -1
  }
}

const gqlAboutPageContent = `query aboutCollectionQuery {
    aboutCollection {
      items{
        sys {
          id
        }
        abouttext2 {json}, imageurl 
      }
  }
}`

  interface AboutPageContent {
    sys: {
      id: string;
    };
    abouttext2: any,
    imageurl:string,
  }
  
  interface AboutCollectionResponse {
    aboutCollection: {
      items: AboutPageContent[];
    };
  }
  
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
          abouttext2: item.abouttext2,
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