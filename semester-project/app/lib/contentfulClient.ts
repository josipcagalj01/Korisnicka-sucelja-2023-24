const BASE_URL=`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`

export interface newsParams {
  offset: number,
  limit: number
  desiredId:number | undefined
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
    body: string,
    imageurl:string,
    imagetitle: string
}

export interface newsPackage {
    count: number,
    news: News[]
}



export const getNews = async (params:newsParams): Promise<newsPackage> => {

  const query = `query newsCollectionQuery {
    newsCollection ${ params.offset>0 || params.limit>0 || params.desiredId != undefined ? `(${params.offset>0 ? `skip:${params.offset} ` : ""}${params.limit>0 ? `limit:${params.limit}` : ''} ${params.desiredId!=undefined &&params.desiredId>=0  ? `where: {id:${params.desiredId}}` : ""})` : ''} {
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

interface newsTotalCountResponse {
  newsCollection: {
    total:number
  }
}

export async function getTotalNewsCount():Promise<number> {

  const query = `query getTotalNewsCountQuery {
    newsCollection {
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