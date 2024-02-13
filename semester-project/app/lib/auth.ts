import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter} from '@next-auth/prisma-adapter'
import {db} from './db'
import {compare} from 'bcrypt'

export const authOptions: NextAuthOptions = {
    //adapter: PrismaAdapter(db),
		secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt' 
    },
    pages: {
        signIn:'/prijava'
    },
    providers: [
        
        CredentialsProvider({
					name:'Credentials',
					credentials: {
						username: {label: 'Username', type: 'username', placeholder: "netko"},
						password: {label: 'Password', type: 'password'}
          },
          
					// @ts-ignore
          async authorize(credentials) {
          	if(!credentials?.username || !credentials.password) return null

            let existingUser = await db.user.findUnique( {where: {username: credentials?.username}})
            if(!existingUser) 
              existingUser = await db.user.findUnique( {where: {email: credentials?.username}})
            if(!existingUser)  return null

            const passwordMatch = await compare(credentials.password, existingUser.password)
            if(!passwordMatch) return null
            return {
                id: existingUser.id,
                name: existingUser.name,
                surname: existingUser.surname,
                username: existingUser.username,
                email: existingUser.email,
                category: existingUser.category,
                address: existingUser.address,
                pin: existingUser.pin
            }
						
        }
        })
    ],
		callbacks: {
			async jwt({ token, user}) {
        if (user) {
          token.id=user.id
          token.pin=user.pin
          token.name=user.name
          token.surname=user.surname
          token.username = user.username
          token.email = user.email
          token.category = user.category
          token.address = user.address
        }
        
        return token;
    },
      async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as number
            session.user.username = token.username as string
            session.user.email = token.email as string
            session.user.pin=token.pin as string
            session.user.address = token.address as string
            session.user.name = token.name as string
            session.user.surname = token.surname as string
            session.user.category = token.category as number
        }

        return session;
      }
    }
}
