import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from './db'
import { compare } from 'bcrypt'

export interface User {
	id: number,
	pin: string,
	name: string,
	surname: string,
	street: string,
	house_number: string,
	town: string,
	place: string,
	role_id:number,
	department_id?: number,
	email: string,
	username: string,
	password: string
}

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(db),
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: 8 * 60 * 60
	},
	pages: {
		signIn: '/prijava'
	},
	providers: [

		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'username', placeholder: "netko" },
				password: { label: 'Password', type: 'password' }
			},

			// @ts-ignore
			async authorize(credentials) {
				if (!credentials?.username || !credentials.password) return null

				let existingUser: User[] = await db.$queryRaw`SELECT id, pin, name, surname, street, house_number, town, place, department_id, role_id, username, password, email FROM public.user WHERE username=${credentials.username} OR email=${credentials.username};`
				if (!existingUser.length) return null

				const passwordMatch = await compare(credentials.password, existingUser[0].password)
				
				if (!passwordMatch) return null
				const {password, ...rest} = existingUser[0]
				return { ...rest }
			}
		})
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.pin = user.pin
				token.name = user.name
				token.surname = user.surname
				token.username = user.username
				token.email = user.email
				token.role_id = user.role_id
				token.department_id = user.department_id
				token.street = user.street
				token.house_number = user.house_number
				token.place = user.place
				token.town = user.town
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as number
				session.user.username = token.username as string
				session.user.email = token.email as string
				session.user.pin = token.pin as string
				session.user.street = token.street as string
				session.user.house_number = token.house_number as string
				session.user.place = token.place as string,
				session.user.town = token.town as string
				session.user.name = token.name as string
				session.user.surname = token.surname as string
				session.user.department_id = token.department_id as number
				session.user.role_id = token.role_id as number
			}
			return session;
		}
	}
}
