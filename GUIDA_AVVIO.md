# Guida Completa Avvio Applicazione

## ✅ Checklist Completamento

### Frontend
- [x] Progetto React creato con TypeScript
- [x] Dipendenze installate (antd, axios, @azure/msal-browser, @azure/msal-react)
- [x] File `.env.local` creato con configurazione Azure AD
- [x] Struttura cartelle creata (types, services, components)
- [x] Modelli TypeScript definiti (`models.ts`)
- [x] Servizi API implementati (`api.ts`, `ticketService.ts`, `lookupService.ts`)
- [x] Componenti React implementati (`TicketTable.tsx`, `ForeignKeySelect.tsx`)
- [x] App.tsx aggiornato con autenticazione MSAL
- [x] Styling configurato

### Backend
- [x] Progetto .NET 10 creato e compilato
- [x] Controllers implementati (Tickets, Competenze, MacroCause, Cause, Commenti)
- [x] DbContext configurato
- [x] Azure AD authentication configurata
- [x] CORS configurato per frontend

### Database
- [ ] **DA FARE**: Eseguire script SQL per creare tabelle e dati

## 🚀 Passi per Avviare l'Applicazione

### Passo 1: Configurare il Database

Apri Azure Data Studio o SQL Server Management Studio e connettiti al database Fabric usando la connection string:

```
Server=jxbqdy74rvpujmzpttqqewlehe-xs5s6bwrjy7eloim5vh5x46hf4.database.fabric.microsoft.com,1433;
Database=UserInputDatabase-df5017e9-bab5-4c85-9253-d478ef679db4;
Encrypt=True;
TrustServerCertificate=False;
Authentication=Active Directory Interactive;
```

**Esegui lo script SQL:**
```bash
# Il file è in: backend\setup-database.sql
```

Lo script:
- Crea tutte le tabelle se non esistono
- Crea indici per performance
- Popola le tabelle di lookup con dati di esempio

### Passo 2: Verificare Configurazione Azure AD

Il file `backend\appsettings.json` è già configurato con:
- **Domain**: all4me.cloud
- **TenantId**: e301c34d-8dfc-445f-b32f-9ce102596439
- **ClientId**: 07041f91-3a96-43f5-816a-d2ffeb021f5c

**Verifica nel portale Azure AD:**
1. Vai su https://portal.azure.com
2. Azure Active Directory > App Registrations
3. Cerca l'app con Client ID: `07041f91-3a96-43f5-816a-d2ffeb021f5c`
4. **Verifica Redirect URIs**:
   - Aggiungi `http://localhost:3000` come SPA redirect URI
   - Aggiungi `https://localhost:7000/signin-oidc` come Web redirect URI
5. **API Permissions**:
   - Verifica che `User.Read` sia presente
6. **Expose an API**:
   - Verifica che lo scope `access_as_user` esista

### Passo 3: Avviare il Backend

```powershell
cd C:\code\TTMPietro\backend
dotnet run
```

Il backend sarà disponibile su:
- HTTPS: https://localhost:7000
- Swagger UI: https://localhost:7000/scalar/v1

**Verifica:**
- Apri il browser su https://localhost:7000/scalar/v1
- Dovresti vedere la documentazione API

### Passo 4: Avviare il Frontend

In un **nuovo terminale**:

```powershell
cd C:\code\TTMPietro\frontend
npm start
```

Il frontend sarà disponibile su:
- HTTP: http://localhost:3000

**Comportamento atteso:**
1. Il browser si apre automaticamente
2. Vedrai la pagina di login
3. Click su "Accedi con Azure AD"
4. Autenticazione Azure AD
5. Dopo il login, vedrai la tabella dei ticket

## 🔍 Test dell'Applicazione

### Test 1: Autenticazione
1. Accedi al frontend: http://localhost:3000
2. Click su "Accedi con Azure AD"
3. Inserisci le credenziali Azure AD
4. Verifica che venga mostrata la tabella

### Test 2: Visualizzazione Ticket
1. Dopo il login, dovresti vedere una tabella vuota (se non ci sono ticket)
2. I dropdown per Competenza, Macro Causa e Causa dovrebbero essere popolati

### Test 3: Creazione Ticket (manuale via API)
Puoi usare Swagger UI o Postman:
```json
POST https://localhost:7000/api/tickets
{
  "titolo": "Test Ticket",
  "descrizione": "Ticket di test",
  "competenzaId": 1,
  "macroCausaId": 1,
  "causaId": 1,
  "stato": "Aperto",
  "priorita": "Media",
  "creatoDa": "Test User"
}
```

### Test 4: Modifica Inline
1. Click su "Modifica" su un ticket
2. Cambia Competenza, Stato o Priorità
3. Click su "Salva"
4. Verifica che le modifiche siano salvate

## 🐛 Troubleshooting

### Errore 401 Unauthorized
**Causa**: Token JWT non valido o mancante
**Soluzione**:
1. Verifica configurazione Azure AD in `.env.local`
2. Controlla che i redirect URIs siano corretti
3. Fai logout e riprova il login

### CORS Error
**Causa**: Backend non accetta richieste da localhost:3000
**Soluzione**:
- Verifica che `FrontendUrl` in `appsettings.json` sia `http://localhost:3000`
- Riavvia il backend

### Database Connection Failed
**Causa**: Connection string errata o permessi mancanti
**Soluzione**:
1. Verifica connection string in `appsettings.json`
2. Assicurati di avere accesso al database Fabric
3. Prova a connetterti con Azure Data Studio

### Dropdown vuoti (Competenza, Macro Causa, Causa)
**Causa**: Database non popolato
**Soluzione**:
- Esegui lo script `setup-database.sql` sul database

### Frontend non si avvia
**Causa**: Dipendenze mancanti o errori TypeScript
**Soluzione**:
```powershell
cd frontend
npm install
npm start
```

### Backend non compila
**Causa**: Errori di compilazione
**Soluzione**:
```powershell
cd backend
dotnet clean
dotnet restore
dotnet build
```

## 📝 Prossimi Passi (Opzionali)

Dopo aver verificato che l'applicazione funziona, puoi:

1. **Implementare Creazione Ticket nel Frontend**
   - Creare un form modale per nuovo ticket
   - Aggiungere validazione

2. **Aggiungere Gestione Commenti**
   - Panel per visualizzare commenti
   - Form per aggiungere nuovi commenti

3. **Implementare Import CSV**
   - Dialog per upload file CSV
   - Parser e validazione dati

4. **Deploy su Azure**
   - Frontend: Azure Static Web Apps
   - Backend: Azure App Service
   - Configurare Managed Identity per il database

## 📚 Documenti di Riferimento

- `README.md` - Overview generale
- `QUICKSTART.md` - Guida rapida
- `TODO.md` - Lista attività
- `docs/database-schema.md` - Schema database dettagliato
- `docs/frontend-setup.md` - Setup frontend
- `docs/react-components-examples.md` - Esempi componenti
- `docs/azure-deployment.md` - Guida deployment Azure

## ✅ Riepilogo Finale

**Tutto è pronto!** Devi solo:

1. ✅ Eseguire lo script SQL (`backend\setup-database.sql`)
2. ✅ Avviare il backend (`cd backend && dotnet run`)
3. ✅ Avviare il frontend (`cd frontend && npm start`)
4. ✅ Testare l'applicazione

Buon lavoro! 🚀
