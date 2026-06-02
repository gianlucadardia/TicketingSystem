# Frontend Setup Instructions

## Prerequisites

Node.js 18+ e npm devono essere installati sul sistema.

**Scarica Node.js:** https://nodejs.org/

## Creazione del Progetto Frontend

Dopo aver installato Node.js, esegui i seguenti comandi dalla directory radice del progetto:

```bash
# Crea l'applicazione React con TypeScript
npx create-react-app@latest frontend --template typescript

# Naviga nella directory frontend
cd frontend

# Installa le dipendenze necessarie
npm install antd axios react-router-dom @azure/msal-browser @azure/msal-react
npm install --save-dev @types/react-router-dom

# Avvia il server di sviluppo
npm start
```

L'applicazione sarà disponibile su http://localhost:3000

## Struttura Frontend

```
frontend/
├── public/
├── src/
│   ├── components/          # Componenti React riutilizzabili
│   │   ├── TicketTable.tsx  # Tabella Ant Design per i ticket
│   │   ├── ForeignKeySelect.tsx # Dropdown per chiavi esterne
│   │   ├── ImportDialog.tsx # Dialog per import CSV
│   │   └── ...
│   ├── services/            # Servizi API per chiamate al backend
│   │   ├── api.ts          # Configurazione axios e autenticazione
│   │   ├── ticketService.ts
│   │   └── ...
│   ├── types/              # TypeScript types
│   │   └── models.ts       # Interfacce per Ticket, Competenza, etc.
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

## Configurazione Azure AD

1. Vai al portale Azure: https://portal.azure.com
2. Crea un nuovo App Registration in Azure Active Directory
3. Configura le seguenti impostazioni:
   - Redirect URI: `http://localhost:3000` (tipo SPA)
   - Implicit grant: ID tokens
4. Copia i seguenti valori da usare nel frontend:
   - Client ID
   - Tenant ID
5. Vai alla sezione "API permissions" e aggiungi:
   - Microsoft Graph > User.Read
   - Aggiungi lo scope dell'API backend

## File di Configurazione Frontend

Crea un file `.env.local` nella directory frontend:

```env
REACT_APP_API_URL=https://localhost:7000/api
REACT_APP_AZURE_CLIENT_ID=YOUR_CLIENT_ID
REACT_APP_AZURE_TENANT_ID=YOUR_TENANT_ID
REACT_APP_AZURE_REDIRECT_URI=http://localhost:3000
```

## Componenti Principali

### 1. TicketTable.tsx
Tabella Ant Design con funzionalità:
- Visualizzazione di tutti i ticket
- Editing inline
- Ricerca e filtri
- Paginazione

### 2. ForeignKeySelect.tsx
Dropdown per selezionare valori da tabelle di lookup:
- Competenza
- MacroCausa
- Causa (cascading con MacroCausa)

### 3. ImportDialog.tsx
Dialog per importare dati da file CSV:
- Upload file
- Anteprima dati
- Mappatura colonne
- Importazione batch

## Integrazione MSAL (Azure AD)

L'applicazione usa `@azure/msal-react` per l'autenticazione:

```typescript
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`,
    redirectUri: process.env.REACT_APP_AZURE_REDIRECT_URI
  }
};

const pca = new PublicClientApplication(msalConfig);

<MsalProvider instance={pca}>
  <App />
</MsalProvider>
```

## API Service

Tutte le chiamate API usano axios con interceptor per aggiungere il token JWT:

```typescript
import axios from 'axios';
import { useMsal } from '@azure/msal-react';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Interceptor per aggiungere token JWT
apiClient.interceptors.request.use(async (config) => {
  const { instance, accounts } = useMsal();
  const accessTokenRequest = {
    scopes: ['api://YOUR_BACKEND_CLIENT_ID/access_as_user'],
    account: accounts[0]
  };
  const response = await instance.acquireTokenSilent(accessTokenRequest);
  config.headers.Authorization = `Bearer ${response.accessToken}`;
  return config;
});
```

## Sviluppo Locale

1. Avvia il backend: `cd backend && dotnet run`
2. Avvia il frontend: `cd frontend && npm start`
3. L'app sarà disponibile su http://localhost:3000
4. Le API saranno disponibili su https://localhost:7000/api

## Build per Produzione

```bash
cd frontend
npm run build
```

I file ottimizzati saranno nella directory `frontend/build/` e possono essere deployati su Azure Static Web Apps o Azure Blob Storage con Static Website.
