# V5 Private Beta
1. Eseguire migration-v5.sql una sola volta in SQL Editor, nuova query. Non rieseguire gli script precedenti.
2. Caricare tutti i file web nella root GitHub, non il file SQL (conservarlo localmente). Rimuovere il vecchio app.js. Ricaricare il sito; se necessario cancellare i dati/cache del sito e reinstallare la PWA.
3. Accedere con account admin già creato. Creare un secondo utente maggiorenne in Authentication, poi inserire il suo UID in public.riders con nickname unico, role rider, active true. Non condividere password.
4. Testare con due browser: foto pending non visibile al secondo rider; approvare da admin; aggiornare feed; verificare ranking dopo approvazione richiesta bandiera. Verificare accesso anonimo e accesso admin negato al rider.
Limiti: prototipo non verificato sul server, UI semplificata rispetto alla V4, nessuna AI/MFA/GPX/video/seguimi, bandiere su richiesta manuale senza verifica GPS, territorio Lazio inserito manualmente. Non usare dati di minori. Le immagini sono ricodificate lato client, non validate lato server. Non aprire al pubblico prima di audit, privacy e test. Nessun dato demo importato.
