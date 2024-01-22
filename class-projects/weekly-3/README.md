# 12. tjedan [15.01.2024.-21.01.2024.]

## Napravljeno:

- nadopunjen model sadržaja koji će se učitavati sa Contentfula
- stvorena zasebna komponenta koja učitava i prikaz obavijesti na početnoj stranici i stranici s obavijestima
- dodana komponenta koja se prikazuje pri čekanju na odgovor poslužitelja pri registraciji/prijavi, kao i pri učitavanju sadržaja s Contentfula
- mogućnost promijene lozinke
- korištenje komponente Suspense za prikaz informacije o učitavanju unutar serverskih komponenti
- određeni dijelovi sučelja izdvojeni u zasebne komponente
- poboljšano prilagođavanje komponenti pri korištenju u različitim uvjetima dodavanjem argumenata funkcijama koje ih predstavljaju
- unaprijeđena kontrola sesije, omogućena sinkronizacija sesije između kartica preglednika
- omogućeno dohvaćanje obogaćenog teksta sa Contentfula
otklonjeni uočeni nedostatci s mehanizmom prijave uočeni pri unaprijeđenju kontrole sesije
- omogućeno filtriranje sadržaja s Contentfula te paginacija

## Problemi:

- nemogućnost pokretanja aplikacije u produkcijskom načinu rada
	- **rješenje**: promjena naziva datoteka s izvornim kodom komponenti (datotene s izvornim kodom komponenti koji ne predstalja samu web stranicu, već samo neku od komponenti sučelja ne smmiju imati naziv „page.tsx.“