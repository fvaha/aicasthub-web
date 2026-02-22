const fs = require('fs');

const en = JSON.parse(fs.readFileSync('./src/dictionaries/EN.json', 'utf8'));
const sr = JSON.parse(fs.readFileSync('./src/dictionaries/SR.json', 'utf8'));
const de = JSON.parse(fs.readFileSync('./src/dictionaries/DE.json', 'utf8'));

const msgsEN = {
    "active_projects": "Active Projects",
    "completed_archive": "Completed / Archive",
    "done": "Done",
    "awaiting_approval": "Awaiting your approval",
    "awaiting_buyer": "Awaiting Buyer Approval",
    "escrow_money": "escrow",
    "no_active_projects": "No Active Projects",
    "no_active_projects_sub": "You don't have any active collaborations. Browse AI actors to start a new project.",
    "browse_actors": "Browse AI Actors",
    "secure_escrow": "Secure Escrow",
    "upload_preview": "Upload Preview",
    "mark_delivered": "Mark as Delivered",
    "delivered": "Delivered",
    "approve_release": "Approve & Release Funds",
    "awaiting_delivery": "Awaiting Delivery...",
    "secure_collab_channel": "Secure Collaboration Channel",
    "start_describing_project": "Start describing your project requirements here.",
    "project_briefing_channel": "Project Briefing Channel",
    "wait_client_input": "Wait for client input or send instructions for the project.",
    "secure_encrypted": "Secure: Encrypted & Audited",
    "submit_final_work": "Submit Final Work for Release",
    "type_message_client": "Message studio or upload project brief...",
    "type_message_seller": "Write a response to client or attach work...",
    "client": "Client",
    "preview_sent": "Preview Sent",
    "preview_from_creator": "Preview from Creator",
    "return_to_dash": "Return to Dashboard",
    "select_project": "Select a project from the sidebar to start communicating with your clients."
};

const msgsSR = {
    "active_projects": "Aktivni Projekti",
    "completed_archive": "Završeno / Arhiva",
    "done": "Spreman",
    "awaiting_approval": "Čeka se vaše odobrenje",
    "awaiting_buyer": "Čeka se odobrenje klijenta",
    "escrow_money": "na depozitu",
    "no_active_projects": "Nema Aktivnih Projekata",
    "no_active_projects_sub": "Nemate aktivnih saradnji. Pretražite AI glumce da započnete novi projekat.",
    "browse_actors": "Pretraži AI Glumce",
    "secure_escrow": "Siguran Depozit",
    "upload_preview": "Otpremi Pregled",
    "mark_delivered": "Označi kao Isporučeno",
    "delivered": "Isporučeno",
    "approve_release": "Odobri i Pusti Sredstva",
    "awaiting_delivery": "Čeka se Isporuka...",
    "secure_collab_channel": "Siguran Kanal za Saradnju",
    "start_describing_project": "Počnite da opisujete zahteve vašeg projekta ovde.",
    "project_briefing_channel": "Kanal za Brifing Projekta",
    "wait_client_input": "Sačekajte instrukcije klijenta ili pošaljite poruku u vezi projekta.",
    "secure_encrypted": "Sigurno: Kriptovano i Revidirano",
    "submit_final_work": "Predaj Završni Rad za Isplatu",
    "type_message_client": "Pošaljite poruku studiju ili otpremite brif projekta...",
    "type_message_seller": "Napišite odgovor klijentu ili priložite rad...",
    "client": "Klijent",
    "preview_sent": "Pregled Poslat",
    "preview_from_creator": "Pregled od Kreatora",
    "return_to_dash": "Nazad na Tablu",
    "select_project": "Izaberite projekat iz menija za komunikaciju."
};

const msgsDE = {
    "active_projects": "Aktive Projekte",
    "completed_archive": "Abgeschlossen / Archiv",
    "done": "Erledigt",
    "awaiting_approval": "Warten auf Ihre Genehmigung",
    "awaiting_buyer": "Warten auf Kundenfreigabe",
    "escrow_money": "auf Treuhandkonto",
    "no_active_projects": "Keine aktiven Projekte",
    "no_active_projects_sub": "Sie haben keine aktiven Kooperationen. Durchsuchen Sie KI-Schauspieler, um ein neues Projekt zu starten.",
    "browse_actors": "KI-Schauspieler durchsuchen",
    "secure_escrow": "Sicheres Treuhandkonto",
    "upload_preview": "Vorschau hochladen",
    "mark_delivered": "Als geliefert markieren",
    "delivered": "Geliefert",
    "approve_release": "Genehmigen & Gelder freigeben",
    "awaiting_delivery": "Warten auf Lieferung...",
    "secure_collab_channel": "Sicherer Zusammenarbeitskanal",
    "start_describing_project": "Beginnen Sie hier mit der Beschreibung Ihrer Projektanforderungen.",
    "project_briefing_channel": "Projektbesprechungskanal",
    "wait_client_input": "Warten Sie auf Kundeneingaben oder senden Sie Anweisungen für das Projekt.",
    "secure_encrypted": "Sicher: Verschlüsselt & Überprüft",
    "submit_final_work": "Endgültige Arbeit zur Freigabe einreichen",
    "type_message_client": "Senden Sie eine Nachricht an das Studio oder laden Sie das Projekt-Briefing hoch...",
    "type_message_seller": "Schreiben Sie eine Antwort an den Kunden oder fügen Sie Arbeit bei...",
    "client": "Kunde",
    "preview_sent": "Vorschau gesendet",
    "preview_from_creator": "Vorschau vom Schöpfer",
    "return_to_dash": "Zurück zum Dashboard",
    "select_project": "Wählen Sie ein Projekt aus dem Menü, um zu kommunizieren."
};

const navEn = {
    "dashboard": "Dashboard",
    "login": "Login / Register",
    "catalog": "View Catalog",
    "back_to_catalog": "Back to Catalog",
    "messages": "Messages",
    "my_actors": "My AI Actors",
    "promote": "Promote Actors",
    "payout": "Payout Settings",
    "overview": "Overview",
    "history": "History & Orders",
    "upgrade": "Upgrade Plan",
    "logout": "Logout"
};

const navSr = {
    "dashboard": "Komandna tabla",
    "login": "Prijava / Registracija",
    "catalog": "Katalog Modela",
    "back_to_catalog": "Nazad u Katalog",
    "messages": "Poruke",
    "my_actors": "Moji AI Glumci",
    "promote": "Promoviši",
    "payout": "Isplate",
    "overview": "Pregled",
    "history": "Istorija i Narudžbine",
    "upgrade": "Unapredi Plan",
    "logout": "Odjavi se"
};

const navDe = {
    "dashboard": "Dashboard",
    "login": "Anmelden / Registrieren",
    "catalog": "Katalog anzeigen",
    "back_to_catalog": "Zurück zum Katalog",
    "messages": "Nachrichten",
    "my_actors": "Meine KI-Schauspieler",
    "promote": "Akteure bewerben",
    "payout": "Auszahlung",
    "overview": "Übersicht",
    "history": "Verlauf & Bestellungen",
    "upgrade": "Plan aktualisieren",
    "logout": "Abmelden"
};

en.messages = msgsEN;
en.nav = navEn;

sr.messages = msgsSR;
sr.nav = navSr;
if (!sr.escrow) sr.escrow = {
    "status_held": "Plaćanje zadržano na depozitu",
    "status_released": "Plaćanje oslobođeno glumcu",
    "status_refunded": "Plaćanje refundirano klijentu",
    "status_disputed": "Sporno plaćanje",
    "amount": "Ukupni iznos",
    "release_btn": "Oslobodi Plaćanje",
    "refund_btn": "Refundiraj",
    "secure_badge": "Sigurno plaćanje depozita"
};

de.messages = msgsDE;
de.nav = navDe;
if (!de.escrow) de.escrow = {
    "status_held": "Zahlung auf Treuhandkonto einbehalten",
    "status_released": "Zahlung an Schauspieler freigegeben",
    "status_refunded": "Zahlung an Kunde erstattet",
    "status_disputed": "Bestrittene Zahlung",
    "amount": "Gesamtbetrag",
    "release_btn": "Zahlung freigeben",
    "refund_btn": "Rückerstattung",
    "secure_badge": "Sichere Treuhandzahlung"
};

fs.writeFileSync('./src/dictionaries/EN.json', JSON.stringify(en, null, 4));
fs.writeFileSync('./src/dictionaries/SR.json', JSON.stringify(sr, null, 4));
fs.writeFileSync('./src/dictionaries/DE.json', JSON.stringify(de, null, 4));

console.log('Dictionaries updated successfully.');
