# Guida Rapida - Ticketing System

## Stato Attuale del Progetto

✅ **Completato:**
- Backend ASP.NET Core Web API (.NET 10)
- Modelli Entity Framework Core per tutte le entità
- DbContext configurato con relazioni tra tabelle
- Controllers REST API per tutti gli endpoint
- Configurazione Azure AD authentication
- Configurazione CORS per il frontend
- Documentazione database schema
- Documentazione deployment Azure

⏳ **Da Completare:**
- Installazione Node.js (prerequisito per il frontend)
- Creazione applicazione React frontend
- Implementazione componenti UI con Ant Design
- Configurazione Azure AD nel portale Azure
- Test end-to-end dell'applicazione
- Deployment su Azure App Service

## Prerequisiti Mancanti

### 1. Node.js
**Scarica e installa Node.js 18+ LTS:**
https://nodejs.org/

Dopo l'installazione, verifica con:
```bash
node --version
npm --version
```

### 2. Azure AD App Registration
1. Vai al portale Azure: https://portal.azure.com
2. Azure Active Directory > App Registrations > New Registration
3. Nome: "Ticketing System"
4. Supported account types: Single tenant
5. Redirect URI (SPA): `http://localhost:3000`
6. Dopo la creazione, copia:
   - Application (client) ID
   - Directory (tenant) ID

## Passi per Avviare il Progetto

### Passo 1: Configura Azure AD nel Backend

Modifica `backend/appsettings.json` e sostituisci:
- `YOUR_TENANT_DOMAIN` con il tuo dominio Azure (es: contoso.onmicrosoft.com)
- `YOUR_TENANT_ID` con il Tenant ID copiato
- `YOUR_CLIENT_ID` con il Client ID copiato

### Passo 2: Crea il Database

Esegui lo script SQL in `docs/database-schema.md` sul database Fabric per creare:
- Le tabelle (ticket_aperti, competenza, macro_causa, causa, commenti)
- Gli indici
- I dati di esempio per le tabelle di lookup

Puoi usare Azure Data Studio o SQL Server Management Studio.

### Passo 3: Avvia il Backend

```bash
cd backend
dotnet run
```

Il backend sarà disponibile su https://localhost:7000

### Passo 4: Crea il Frontend (dopo aver installato Node.js)

Segui le istruzioni in `docs/frontend-setup.md`:

```bash
# Dalla directory radice del progetto
npx create-react-app frontend --template typescript
cd frontend
npm install antd axios react-router-dom @azure/msal-browser @azure/msal-react
npm install --save-dev @types/react-router-dom
```

### Passo 5: Configura il Frontend

Crea il file `.env.local` in `frontend/`:

```env
REACT_APP_API_URL=https://localhost:7000/api
REACT_APP_AZURE_CLIENT_ID=YOUR_CLIENT_ID
REACT_APP_AZURE_TENANT_ID=YOUR_TENANT_ID
REACT_APP_AZURE_REDIRECT_URI=http://localhost:3000
```

### Passo 6: Avvia il Frontend

```bash
cd frontend
npm start
```

Il frontend sarà disponibile su http://localhost:3000

## Struttura del Progetto

```
TTMPietro/
├── backend/                    # ASP.NET Core Web API (.NET 10)
│   ├── Controllers/            # API Controllers (Tickets, Competenze, etc.)
│   ├── Data/                   # ApplicationDbContext
│   ├── Models/                 # Entity models (TicketAperto, Competenza, etc.)
│   ├── Services/               # Business logic (da implementare)
│   ├── Program.cs              # Configurazione app
│   ├── appsettings.json        # Configurazione (DA COMPILARE)
│   └── TicketingSystem.csproj
│
├── frontend/                   # React + TypeScript (DA CREARE)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Componenti React
│   │   ├── services/           # API client
│   │   └── types/              # TypeScript interfaces
│   └── package.json
│
├── docs/
│   ├── database-schema.md      # Schema SQL completo
│   ├── frontend-setup.md       # Istruzioni frontend
│   └── azure-deployment.md     # Guida deployment Azure
│
└── README.md                   # Documentazione principale
```

## API Endpoints Disponibili

### Tickets
- `GET /api/tickets` - Lista tutti i ticket
- `GET /api/tickets/{id}` - Dettaglio ticket
- `GET /api/tickets/search?query=test&stato=Aperto` - Ricerca ticket
- `POST /api/tickets` - Crea nuovo ticket
- `PUT /api/tickets/{id}` - Aggiorna ticket
- `DELETE /api/tickets/{id}` - Elimina ticket

### Competenze
- `GET /api/competenze` - Lista competenze attive
- `GET /api/competenze/{id}` - Dettaglio competenza
- `POST /api/competenze` - Crea competenza
- `PUT /api/competenze/{id}` - Aggiorna competenza
- `DELETE /api/competenze/{id}` - Elimina competenza

### MacroCause
- `GET /api/macrocause` - Lista macro cause attive
- `GET /api/macrocause/{id}` - Dettaglio macro causa (con cause)
- `POST /api/macrocause` - Crea macro causa
- `PUT /api/macrocause/{id}` - Aggiorna macro causa
- `DELETE /api/macrocause/{id}` - Elimina macro causa

### Cause
- `GET /api/cause` - Lista tutte le cause
- `GET /api/cause/bymacrocausa/{id}` - Cause per macro causa
- `GET /api/cause/{id}` - Dettaglio causa
- `POST /api/cause` - Crea causa
- `PUT /api/cause/{id}` - Aggiorna causa
- `DELETE /api/cause/{id}` - Elimina causa

### Commenti
- `GET /api/commenti/ticket/{ticketId}` - Commenti per ticket
- `GET /api/commenti/{id}` - Dettaglio commento
- `POST /api/commenti` - Crea commento
- `PUT /api/commenti/{id}` - Aggiorna commento
- `DELETE /api/commenti/{id}` - Elimina commento

## Test delle API

### Con curl (richiede autenticazione Azure AD):
```bash
# Ottieni un token
# (vedi documentazione Azure AD)

# Testa l'endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" https://localhost:7000/api/tickets
```

### Con Swagger/OpenAPI:
Apri https://localhost:7000/scalar/v1 nel browser quando il backend è in esecuzione.

## Prossimi Passi

1. **Installa Node.js** se non ancora installato
2. **Configura Azure AD** nel portale Azure
3. **Compila appsettings.json** con i valori Azure AD
4. **Crea il database** eseguendo lo script SQL
5. **Avvia il backend** e verifica che compili
6. **Crea il frontend** seguendo le istruzioni
7. **Implementa i componenti React** per la UI
8. **Testa l'applicazione** end-to-end
9. **Deploy su Azure** quando sei pronto

## Supporto

Per problemi o domande:
- Consulta i file nella cartella `docs/`
- Verifica i log del backend in console
- Controlla la console del browser per errori frontend
- Verifica la configurazione Azure AD se ci sono problemi di autenticazione

## Comandi Utili

```bash
# Backend
cd backend
dotnet build              # Compila il progetto
dotnet run                # Avvia il server
dotnet ef migrations add InitialCreate  # Crea migration
dotnet ef database update               # Applica migration

# Frontend (dopo aver creato il progetto)
cd frontend
npm start                 # Avvia dev server
npm run build             # Build per produzione
npm test                  # Esegui test

# Azure deployment
az login                  # Login ad Azure
# (vedi docs/azure-deployment.md per i comandi completi)
```
