import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import Header from '../components/header/page'
import Footer from '../components/footer/page'
import { getSession } from '../lib/getSession'
import './[postId]/postAndCommentsStyle.css'
import Link from 'next/link'
import clsx from "clsx";

export const metadata: Metadata = {
  title: 'Obavijesti',
  description: 'Stranica s obavijestima informacijskog sustava eKaštela',
  
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface Pagination {
  limit: number;
  page: number;
}

const BASE_API_URL = "https://jsonplaceholder.typicode.com";

const getPosts = async (pagination: Pagination = { limit: 9999, page: 1}): Promise<Post[]> => {
  const data = await fetch(`${BASE_API_URL}/posts?_limit=${pagination.limit}&_page=${pagination.page}`);
  return data.json();
};

const getTotalPosts = async (): Promise<number> => {
  const response = await fetch(`${BASE_API_URL}/posts?_limit=1`, {
    method: "HEAD",
  });
  // get x-total-count header
  return parseInt(response.headers.get("x-total-count") || "1", 10);
};

async function Announcments({searchParams}: {searchParams: Record<string, string | string[] | undefined>;}) {
  const session = await getSession()

  const { _limit, _page } = searchParams;
  const [pageSize, page] = [_limit, _page].map(Number);
  const totalPosts = await getTotalPosts();
  const totalPages = Math.ceil(totalPosts / pageSize);
  
  const posts = await getPosts({limit: pageSize, page: page});

    return (
      <>
        <Header currentPage="Građanski forum" session={session}/>
        <main>
          <h1>Ovo je forum na kojem korisnici gradskoj upravi postavljaju upite, daju primjedbe i prijedloge.</h1>
          <h2>Popis tema</h2>
          
          <ul className="flex flex-col gap-8">
            {posts.map((post) => (
            <li key={post.id}>
              <Link href={`obavijesti/${post.id}`}>
                <span className="text-2xl text-purple-500">
                  Post {post.title}
                </span>
              </Link>
            </li>
            ))}
          </ul>
          {_limit && _page && (
                <div className="flex gap-4 pagesNavigation">
                  <Link href={{pathname: "/obavijesti", query: { _page: 1, _limit: pageSize }}} className={`${page<3 ? 'hidden' : ''} rounded border bg-gray-100 px-3 py-1 text-gray-800`}> Prva </Link>
                  <Link href={{pathname: "/obavijesti", query: { _page: page > 1 ? page - 1 : 1, _limit: pageSize }}} className={`${page<2 ? 'hidden' : ''} clsx("rounded border bg-gray-100 px-3 py-1 text-gray-800", page === 1 && "pointer-events-none opacity-50")`}> Prethodna </Link>
                  <span> Stranica {page} od {totalPages} </span>
                  <Link href={{pathname: "/obavijesti", query: { _page: page + 1, _limit: pageSize }}} className={`${(totalPages-page)<1 ? 'hidden' : ''} clsx("rounded border bg-gray-100 px-3 py-1 text-gray-800", page === totalPages && "pointer-events-none opacity-50")`}> Sljedeća </Link>
                  <Link href={{pathname: "/obavijesti", query: { _page: totalPages, _limit: pageSize } }} className={`${(totalPages-page)<2 ? 'hidden' : ''} rounded border bg-gray-100 px-3 py-1 text-gray-800`}>Posljednja</Link>
                </div>)}
        </main>
        <Footer isLoggedIn={session ? true : false}/>
      </>
    );
  }
export default Announcments;