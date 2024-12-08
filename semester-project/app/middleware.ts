export { default } from "next-auth/middleware"
export const config = { 
	matcher: [
		"/moj-racun", '/moj-racun/:action*',
		'/usluge', '/usluge/:serviceId*', 
		"/api/dodaj-obrazac", "/api/update-form", "/api/ukloni-obrazac",
		"/obrasci", "/obrasci/:options*",
		"/prijave", "/prijave/:serviceId*", "/prijave/:serviceId*/:submissionId*",
		"/api/upload-form-thumbnail", "/api/upload-form-thumbnail/:id",
		"/upravljanje-sustavom/upravljanje-korisnicima", "/upravljanje-sustavom/upravljanje-korisnicima/:option*",
		"/api/update-user",
		"/api/upload-form-file",
		"/api/datoteka/prijave/:option*",
		"/api/dodaj-objavu", "/api/uredi-objavu/", "/api/ukloni-objavu",
		"/objave", "/objave/:options*",
		"/api/upload-announcment-thumbnail", "/api/upload-announcment-file"
	] 
}