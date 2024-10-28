export { default } from "next-auth/middleware"
export const config = { 
	matcher: [
		"/moj-racun", '/moj-racun/:action*',
		'/usluge', '/usluge/:serviceId*', 
		"/api/dodaj-obrazac", "/api/update-form",
		"/obrasci", "/obrasci/:option*",
		"/prijave", "/prijave/:serviceId*", "/prijave/:serviceId*/:submissionId*",
		"/api/upload-form-thumbnail", "/api/upload-form-thumbnail/:id",
		"/upravljanje-sustavom/upravljanje-korisnicima", "/upravljanje-sustavom/upravljanje-korisnicima/:option*",
		"/api/update-user",
	] 
}