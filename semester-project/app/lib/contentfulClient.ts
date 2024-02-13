const BASE_URL=`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`

export interface newsProps {
  offset?: number,
  limit?: number,
  desiredId?:number | undefined,
  category?:string | undefined
}
  
  interface NewstCollectionResponse {
    newsCollection: {
      items: NewsCardData[];
    };
  }
  
export interface NewsCardData {
    sys: {
      id: string;
    };
    id: number,
    title: string,
    date:string,
    category:string,
    summary:string,
    image: {
      url:string,
      title:string
    }
}

interface fullAnnouncmentResponse {
  newsCollection: {
    items:fullAnnouncment[]
  }
}

interface fullAnnouncment {
  sys: {
    id: string;
  },
  id: number,
    title: string,
    date:string,
    category:string,
    body:any,
    image: {
      url:string,
      title:string
    }
}

export interface fullAnnouncmentPackage {
  count:number,
  announcment:fullAnnouncment[]
}

export const getAnnouncment = async ({ offset = 0, limit = 0, desiredId = undefined, category = undefined }: newsProps): Promise<fullAnnouncmentPackage> => {
	const query = `query newsCollectionQuery {
    newsCollection (order:date_DESC ${offset > 0 ? `skip:${offset} ` : ""} ${limit > 0 ? `limit:${limit}` : ''} ${desiredId || category ? `where: {${desiredId ? `id:${desiredId}` : ''} ${category ? `category:"${category}"` : ''}}` : ''}) {
      items {
        sys {
          id
        }
        id,
        title,
        date,
        category,
        body {json},
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
		if (response.ok) {
			const body = (await response.json()) as {
				data: fullAnnouncmentResponse;
			};
			const newsToPublish: fullAnnouncment[] = body.data.newsCollection.items.map((item) => ({
				sys: { id: item.sys.id },
				id: item.id,
				title: item.title,
				date: `${item.date.split('T')[0].split('-')[2]}.${item.date.split('T')[0].split('-')[1]}.${item.date.split('T')[0].split('-')[0]}.`,
				category: item.category,
				body: item.body,
				image: item.image
			}));
			return { count: newsToPublish.length, announcment: newsToPublish };
		}
		else return { count: -1, announcment: [] }
	} catch (error) {
		console.log(error);
		return { count: -1, announcment: [] }
	}
};

interface fetchAnnouncmentTitleResponse {
  newsCollection: {
    items:announcmentTitleInfo[]
  }
}

interface announcmentTitleInfo {
    title: string
}

export interface fetchAnnouncmentTitlePackage {
  count:number,
  announcment:announcmentTitleInfo[]
}

export const getAnnouncmentTitle = async ({desiredId = undefined}: {desiredId:string | undefined}): Promise<fetchAnnouncmentTitlePackage> => {
	const query = `query newsCollectionQuery {
    newsCollection (where: id:${desiredId}) {
      items {
        title
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
		if (response.ok) {
			const body = (await response.json()) as {
				data: fetchAnnouncmentTitleResponse;
			};
			const announcmentTitleDataToSend: announcmentTitleInfo[] = body.data.newsCollection.items.map((item) => ({
				title: item.title,
			}));
			return { count: announcmentTitleDataToSend.length, announcment: announcmentTitleDataToSend };
		}
		else return { count: -1, announcment: [] }
	} catch (error) {
		console.log(error);
		return { count: -1, announcment: [] }
	}
};

export interface newsPackage {
    count: number,
    news: NewsCardData[]
}

export const getNewsCardsData = async ({offset=0,limit=0,desiredId=undefined,category=undefined}:newsProps): Promise<newsPackage> => {
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
        summary,
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
        const newsToPublish: NewsCardData[] = body.data.newsCollection.items.map((item) => ({
          sys: {id: item.sys.id},
          id: item.id,
          title: item.title,
          date: `${item.date.split('T')[0].split('-')[2]}.${item.date.split('T')[0].split('-')[1]}.${item.date.split('T')[0].split('-')[0]}.`,
          category:item.category,
          summary: item.summary,
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