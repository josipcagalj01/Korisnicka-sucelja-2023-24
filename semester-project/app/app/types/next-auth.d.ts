import NextAuth from 'next-auth'

declare module "next-auth" {
    interface User {
        id: number,
        pin: string,
        name: string,
        surname: string,
        address: string,
        category: number,
        email: string,
        username: string
    }
    interface Session {
        user: User
    }
}