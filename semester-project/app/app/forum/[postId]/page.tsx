import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import Header from '../../components/header/page'
import { Post} from '../page'
import './postAndCommentsStyle.css'

interface Params {
    postId: string;
}

const BASE_API_URL = "https://jsonplaceholder.typicode.com";

const getPost = async (id: string): Promise<Post> => {
  const data = await fetch(`${BASE_API_URL}/posts/${id}`);
  return data.json();
};
 
async function ForumPost({ params }: {params: Params}) {
  let post:Post={userId: 0, id:0, title:"", body:""}
  let ok=true;
  try{post = await getPost(params.postId);ok}catch{ok=false}
    return (
      <>
        <head><title>{ok === true ? post.title : `Greška!`}</title></head>
        <body className={inter.className}>
            <Header currentPage='Građanski forum' />
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
        </body>
      </>
    );
    
  }
export default ForumPost