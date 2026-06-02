# Deployment su Azure App Service

Questa guida descrive i passi per deployare l'applicazione su Azure App Service.

## Prerequisiti

- Azure CLI installato: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
- Sottoscrizione Azure attiva
- Backend compilato e funzionante localmente
- Frontend buildato (dopo l'installazione di Node.js)

## Login ad Azure

```bash
az login
```

## 1. Crea un Resource Group

```bash
az group create --name ticketing-system-rg --location westeurope
```

## 2. Crea un App Service Plan

Per produzione (Standard tier con autoscaling):
```bash
az appservice plan create \
  --name ticketing-system-plan \
  --resource-group ticketing-system-rg \
  --sku S1 \
  --is-linux
```

Per sviluppo (Free tier):
```bash
az appservice plan create \
  --name ticketing-system-plan \
  --resource-group ticketing-system-rg \
  --sku F1 \
  --is-linux
```

## 3. Crea il Web App per il Backend

```bash
az webapp create \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg \
  --plan ticketing-system-plan \
  --runtime "DOTNET|10.0"
```

Sostituisci `{unique-name}` con un nome univoco (es. il tuo nome o un numero casuale).

## 4. Configura le App Settings

```bash
# Connection string al database Fabric
az webapp config connection-string set \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="Server=jxbqdy74rvpujmzpttqqewlehe-xs5s6bwrjy7eloim5vh5x46hf4.database.fabric.microsoft.com,1433;Database=UserInputDatabase-df5017e9-bab5-4c85-9253-d478ef679db4;Encrypt=True;TrustServerCertificate=False;Authentication=Active Directory Managed Identity;"

# Configurazione Azure AD
az webapp config appsettings set \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg \
  --settings \
    AzureAd__Instance=https://login.microsoftonline.com/ \
    AzureAd__TenantId=YOUR_TENANT_ID \
    AzureAd__ClientId=YOUR_CLIENT_ID \
    AzureAd__Domain=YOUR_DOMAIN.onmicrosoft.com \
    FrontendUrl=https://ticketing-frontend-{unique-name}.azurewebsites.net
```

## 5. Abilita Managed Identity

```bash
az webapp identity assign \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg
```

Prendi nota del `principalId` restituito dal comando.

## 6. Assegna i Permessi al Database

Nel portale Azure o tramite SQL:
1. Vai al database Fabric
2. Esegui la query:

```sql
CREATE USER [ticketing-api-{unique-name}] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [ticketing-api-{unique-name}];
ALTER ROLE db_datawriter ADD MEMBER [ticketing-api-{unique-name}];
```

## 7. Deploy del Backend

### Opzione A: Da Visual Studio Code
1. Installa l'estensione "Azure App Service"
2. Click destro su `backend` > Deploy to Web App
3. Seleziona il Web App creato

### Opzione B: Da CLI (Zip Deploy)
```bash
cd backend
dotnet publish -c Release -o ./publish
cd publish
zip -r ../app.zip .
cd ..
az webapp deployment source config-zip \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg \
  --src app.zip
```

### Opzione C: Da Visual Studio
1. Click destro sul progetto > Publish
2. Seleziona Azure > Azure App Service (Windows)
3. Segui il wizard

## 8. Crea Static Web App per il Frontend

```bash
az staticwebapp create \
  --name ticketing-frontend-{unique-name} \
  --resource-group ticketing-system-rg \
  --location westeurope
```

Oppure usa Azure Static Web Apps direttamente integrato con GitHub per CI/CD automatico.

### Deploy del Frontend Build

```bash
cd frontend
npm run build

# Carica i file nella Static Web App
az staticwebapp upload \
  --name ticketing-frontend-{unique-name} \
  --resource-group ticketing-system-rg \
  --source ./build
```

## 9. Configura CORS nel Backend

Aggiorna l'App Settings del backend con l'URL del frontend:

```bash
az webapp config appsettings set \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg \
  --settings FrontendUrl=https://ticketing-frontend-{unique-name}.azurestaticapps.net
```

## 10. Aggiorna Azure AD App Registration

1. Vai al portale Azure > Azure Active Directory > App Registrations
2. Seleziona la tua app registration
3. Aggiungi Redirect URIs:
   - https://ticketing-frontend-{unique-name}.azurestaticapps.net
4. Configura le API permissions se necessario

## 11. Verifica il Deployment

```bash
# Verifica lo stato del backend
az webapp show \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg \
  --query state

# Visualizza i log
az webapp log tail \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg
```

Testa l'endpoint API:
```bash
curl https://ticketing-api-{unique-name}.azurewebsites.net/api/tickets
```

## Deployment Automatico con GitHub Actions

### Backend CI/CD

Crea `.github/workflows/backend-deploy.yml`:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '10.0.x'
    
    - name: Build
      run: |
        cd backend
        dotnet publish -c Release -o ./publish
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'ticketing-api-{unique-name}'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./backend/publish
```

### Frontend CI/CD

La Static Web App fornisce automaticamente un workflow GitHub Actions quando colleghi il repository.

## Monitoraggio e Diagnostica

### Abilita Application Insights

```bash
# Crea Application Insights
az monitor app-insights component create \
  --app ticketing-insights \
  --location westeurope \
  --resource-group ticketing-system-rg

# Ottieni la instrumentation key
az monitor app-insights component show \
  --app ticketing-insights \
  --resource-group ticketing-system-rg \
  --query instrumentationKey

# Configura nel Web App
az webapp config appsettings set \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=YOUR_KEY"
```

### Visualizza Metriche

```bash
# Visualizza le richieste HTTP
az monitor app-insights metrics show \
  --app ticketing-insights \
  --resource-group ticketing-system-rg \
  --metric requests/count

# Visualizza i tempi di risposta
az monitor app-insights metrics show \
  --app ticketing-insights \
  --resource-group ticketing-system-rg \
  --metric requests/duration
```

## Scaling

### Manuale
```bash
az appservice plan update \
  --name ticketing-system-plan \
  --resource-group ticketing-system-rg \
  --sku P1V2
```

### Autoscaling
```bash
az monitor autoscale create \
  --resource-group ticketing-system-rg \
  --resource ticketing-system-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-rules \
  --min-count 1 \
  --max-count 5 \
  --count 2

az monitor autoscale rule create \
  --resource-group ticketing-system-rg \
  --autoscale-name autoscale-rules \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1
```

## Backup

```bash
# Abilita backup automatici
az webapp config backup update \
  --resource-group ticketing-system-rg \
  --webapp-name ticketing-api-{unique-name} \
  --backup-name daily-backup \
  --container-url "YOUR_STORAGE_CONTAINER_SAS_URL" \
  --frequency 1d \
  --retain-one true \
  --retention 30
```

## Troubleshooting

### Visualizza i log di deployment
```bash
az webapp log deployment show \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg
```

### SSH nel container
```bash
az webapp ssh \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg
```

### Restart del Web App
```bash
az webapp restart \
  --name ticketing-api-{unique-name} \
  --resource-group ticketing-system-rg
```

## Costi Stimati

- App Service Plan S1: ~€70/mese
- Static Web App: Gratis (tier Free)
- Application Insights: ~€2-5/mese (dipende dall'uso)
- Azure Fabric Database: Varia in base alla capacità

**Totale stimato: €75-80/mese per produzione**

Per sviluppo/test usando Free tier: ~€0-5/mese
