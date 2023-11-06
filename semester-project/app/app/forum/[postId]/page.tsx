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
  const post = await getPost(params.postId);
  
    return (
      <>
        <head><title>{post.title}</title></head>
        <body className={inter.className}>
            <Header currentPage='Građanski forum' />
            <main className="flex flex-col items-center min-h-screen max-w-5xl m-auto p-10">
              <div className='postContainer'>
                <h1 className="text-3xl font-bold p-10 capitalize">
                  Post #{params.postId} {post.title}
                </h1>
                <h2> Napisao/la {post.userId}</h2>
                <br/>
                <p className="text-xl p-10">{post.body}</p>
              </div>
              
            </main>
        </body>
      </>
    );
  }
export default ForumPost