# Sistema Gestione Ticket

Applicazione web per la gestione di ticket con interfaccia React e backend .NET Core, autenticazione Azure AD e deployment su Azure App Service.

## Architettura

- **Frontend**: React 18 + TypeScript + Ant Design
- **Backend**: ASP.NET Core 8 Web API
- **Database**: SQL Server su Microsoft Fabric
- **Autenticazione**: Azure Active Directory
- **Hosting**: Azure App Service

## Struttura Progetto

```
TTMPietro/
├── backend/          # ASP.NET Core Web API
│   ├── Controllers/  # REST API endpoints
│   ├── Models/       # Entity models
│   ├── Data/         # DbContext e configurazione EF Core
│   └── Services/     # Business logic layer
├── frontend/         # React + TypeScript
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   └── types/       # TypeScript interfaces
└── docs/            # Documentazione

```

## Tabelle Database

- **ticket_aperti**: Ticket principali
- **competenza**: Categorie di competenza (lookup)
- **commenti**: Commenti associati ai ticket
- **macro_causa**: Macro categorie causa (lookup)
- **causa**: Cause specifiche, collegate a macro_causa (lookup)

## Setup Locale

### Prerequisiti

- .NET 8.0 SDK
- Node.js 18+ e npm
- SQL Server Management Studio (opzionale, per gestione DB)
- Azure CLI (per autenticazione)

### Backend

```bash
cd backend
dotnet restore
dotnet run
```

API disponibile su: `https://localhost:5001`

### Frontend

```bash
cd frontend
npm install
npm start
```

UI disponibile su: `http://localhost:3000`

## Deployment su Azure

1. **Configurare Azure App Service**
2. **Configurare Managed Identity** per accesso al database
3. **Deploy**: `dotnet publish` + upload su App Service

Vedere `docs/deployment.md` per dettagli completi.

## Funzionalità

- ✅ CRUD completo per tutte le tabelle
- ✅ Gestione foreign keys con dropdown
- ✅ Import dati da CSV
- ✅ Filtri, ricerca, ordinamento, paginazione
- ✅ Autenticazione Azure AD
- ✅ Interfaccia pulita e moderna

## Configurazione

Configurare `backend/appsettings.json` con:
- Connection string Fabric SQL
- Azure AD TenantId e ClientId
- Logging level

## Licenza

Proprietario: [Nome Azienda]
