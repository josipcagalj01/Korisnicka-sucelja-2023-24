import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Katalog usluga',
    description: 'Prikaz i opis usluga informacijskog sustava eKaštela',
}
export default function ListOfServices() {
    return (
    <main>
        <h1>Katalog usluga</h1>
        <br/>
        <p>Usluge trenutno nisu dostupne. O dostupnosti usluga bit ćete pravovremeno obaviješteni.</p>
    </main>
)
}
