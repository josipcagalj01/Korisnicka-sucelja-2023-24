//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import Header from '../../components/header/page'
import { Post} from '../page'
import './postAndCommentsStyle.css'
import { Metadata } from 'next'
import Footer from '../../components/footer/page'
import { getSession } from '../../lib/getSession'

interface Params {
    postId: string;
}

const BASE_API_URL = "https://jsonplaceholder.typicode.com";

const getPost = async (id: string): Promise<Post> => {
  const data = await fetch(`${BASE_API_URL}/posts/${id}`);
  return data.json();
};

export const generateMetadata = async ({ params }: {params: Params}) : Promise<Metadata> => {
  let post:Post={userId: 0, id:0, title:"", body:""}
  let ok=true;
  try {
    post = await getPost(params.postId);
  }
  catch {ok=false}
  let titletext=''
  ok === true ? titletext=post.title : titletext='Greška'
  return {
    title: titletext
  }
}

async function ForumPost({ params }: {params: Params}) {
  const session = await getSession()
  let post:Post={userId: 0, id:0, title:"", body:""}
  let ok=true;
  try{post = await getPost(params.postId); }catch{ok=false}
    return (
        <>
            <Header currentPage='Obavijesti' session={session} />
            <main className="flex flex-col items-center min-h-screen max-w-5xl m-auto p-10">
            {ok === true ? <div className='postContainer'>
                <h1 className="text-3xl font-bold p-10 capitalize">
                  Post #{params.postId} {post.title}
                </h1>
                <h2> Napisao/la {post.userId}</h2>
                <br/>
                <p className="text-xl p-10">{post.body}</p>
              </div> : <p>Dogodila se greška</p>}
              
            </main>
            <Footer isLoggedIn={session ? true : false}/>
        </>
    )
    
  }
export default ForumPost