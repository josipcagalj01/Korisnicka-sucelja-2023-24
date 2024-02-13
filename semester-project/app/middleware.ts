export { default } from "next-auth/middleware"
export const config = { matcher: ["/moj-racun", '/moj-racun/:action*'] }