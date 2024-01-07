import type { Metadata } from 'next'
import Header from '../../../components/header/page'
//import { Inter } from 'next/font/google'
//const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'O sustavu | eKaštela',
  description: 'Opće informacije o platformi eKaštela',
}

function Error() {
    return (
      <body>
        <Header currentPage='O sustavu' />
        <div className="flex justify-center">
          <h1>Error stranica</h1>
        </div>
      </body>
    );
  }

  export default Error;