const gqlHomePageNewsSection = `query newsCollectionQuery {
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

export const getNews = async (): Promise<newsPackage> => {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ query: gqlHomePageNewsSection }),
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