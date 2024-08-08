import NextAuth from 'next-auth'

declare module "next-auth" {
    interface User {
        id: number,
        pin: string,
        name: string,
        surname: string,
        street: string,
        house_number: string,
        place: string,
        town: string,
        role_id:number,
        department_id?: number,
        email: string,
        username: string
    }
    interface Session {
        user: User
    }
}