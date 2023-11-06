import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import Header from './components/header/page'
import './globals.css'

export const metadata: Metadata = {
  title: 'Početna - eKaštela',
  description: 'Početna stranica platforme eKaštela',
}

export default function Home() {
  return (
    <body className={inter.className}>
      <Header currentPage="Početna" />
      <div className="flex justify-center">
        <h1>Ovo je početna stranica</h1>
      </div>
    </body>
  );
}