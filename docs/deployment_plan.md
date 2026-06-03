# Piano: Deploy Ticketing System su Azure

**Data creazione**: 2026-06-02  
**Applicazione**: Sistema di ticketing con backend .NET 8 Web API e frontend React TypeScript

## Architettura Azure

### Componenti
1. **Azure Static Web Apps** - Frontend React (con Preview Environments)
2. **Azure App Service (Linux, .NET 8)** - Backend API (con Deployment Slots)
3. **Microsoft Fabric SQL** - Database (già esistente)
4. **Azure Application Insights** - Monitoring
5. **Azure Key Vault** - Secrets (opzionale)

### Deployment Slots Strategy
- **Backend App Service**: 
  - Slot `production` - Deploy da main branch
  - Slot `staging` - Deploy da PR (auto-creato per PR)
- **Frontend Static Web Apps**:
  - Production environment - Deploy da main branch
  - Preview environments - Auto-creato per ogni PR

### Diagramma
```
GitHub PR (feature branch)
    ↓ GitHub Actions
App Service Slot [staging] + Static Web Apps [preview]
    ↓ Verifica & Test
GitHub Merge to main
    ↓ GitHub Actions
App Service Slot [production] + Static Web Apps [production]
    ↓ Managed Identity
Microsoft Fabric SQL Database
```

## Steps di Deployment

### FASE 1: Pre-requisiti e Setup GitHub
1. Azure CLI login
2. Crea `.env.example` nel frontend con variabili necessarie
3. Fix configurazione backend (HTTPS redirect, health check)
4. **Crea Service Principal per GitHub Actions** (*nuovo*)
   - `az ad sp create-for-rbac` con ruolo Contributor
   - Salva output JSON per GitHub secrets

### FASE 2: Provisioning Infrastruttura Azure
5. Crea Resource Group + App Service Plan (minimo S1 per slots)
6. Crea App Service backend (.NET 8, Managed Identity)
7. **Crea deployment slot 'staging' per backend** (*nuovo*)
   - `az webapp deployment slot create --name ticketing-api --slot staging`
   - Configura stesse app settings del production slot
8. Crea Static Web App frontend **con integrazione GitHub**
   - Preview environments abilitati di default per PR

### FASE 3: Configurazione Backend
9. Configura App Settings su **production slot** (AzureAd, FrontendUrl, App Insights)
10. Configura App Settings su **staging slot** (stessi settings ma FrontendUrl diverso per preview)
11. Configura connection string con Managed Identity (production + staging)
12. Assegna permessi database a Managed Identity (production + staging)
13. **Scarica publish profile per entrambi gli slot** (*nuovo*)
    - Production: per deploy da main
    - Staging: per deploy da PR

### FASE 4: Configurazione Frontend
14. Imposta variabili ambiente (REACT_APP_*) in Static Web App production
15. **Preview environments configurati automaticamente** (*nuovo*)
    - Variabili ambiente ereditate da production
    - URL generato automaticamente per ogni PR (es. `pr-123.azurestaticapps.net`)
16. **Configura deployment token per GitHub** (*già presente*)

### FASE 5: Setup CI/CD Pipeline (*aggiornata con slots*)
17. **Crea workflow PR backend** `.github/workflows/backend-pr.yml` (*nuovo*)
    - Build .NET 8 + run tests
    - Deploy su **slot staging** quando PR aperta/aggiornata
    - Trigger: pull_request con modifiche backend/**
    - Comment su PR con URL staging per test
18. **Crea workflow PR frontend** `.github/workflows/frontend-pr.yml` (*nuovo*)
    - Build React con variabili ambiente
    - Deploy automatico su **preview environment** (gestito da Static Web Apps)
    - Trigger: pull_request con modifiche frontend/**
    - Comment su PR con URL preview per test
19. **Crea workflow deploy production backend** `.github/workflows/backend-deploy.yml`
    - Build .NET 8 + run tests
    - Deploy su **slot production**
    - Trigger: push su main con modifiche backend/**
20. **Crea workflow deploy production frontend** `.github/workflows/frontend-deploy.yml`
    - Build React con variabili ambiente production
    - Deploy su **production environment**
    - Trigger: push su main con modifiche frontend/**
21. **Crea workflow PR validation** `.github/workflows/pr-validation.yml`
    - Lint, build, test generali
    - Quality gates (coverage, lint errors)
    - Trigger: pull_request su qualsiasi path
22. **Configura GitHub Secrets**
    - `AZURE_CREDENTIALS` (service principal JSON)
    - `AZURE_WEBAPP_PUBLISH_PROFILE_PRODUCTION` (backend production)
    - `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING` (backend staging)
    - `AZURE_STATIC_WEB_APPS_API_TOKEN` (frontend)
23. **Configura Branch Protection su main** (*nuovo*)
    - Richiedi PR approval (almeno 1 reviewer)
    - Richiedi status checks passati (tutti i workflow)
    - Impedisci push diretti su main
    - Richiedi branch aggiornato prima di merge

### FASE 6: Workflow Sviluppo Feature (*nuova - workflow completo*)
24. **Sviluppo feature con agenti GitHub** (*nuovo*)
    - Crea feature branch da main (es. `feature/nuovo-filtro-tickets`)
    - Usa GitHub Copilot / agenti per sviluppo automatizzato
    - Commit e push su feature branch
25. **Apertura Pull Request** (*nuovo*)
    - Apri PR da feature branch → main
    - Workflow automatici si attivano:
      - `pr-validation.yml` - Build + test + lint
      - `backend-pr.yml` - Deploy su slot staging
      - `frontend-pr.yml` - Deploy su preview environment
    - Bot commenta PR con URL per test:
      - Backend staging: `https://ticketing-api-{unique}-staging.azurewebsites.net`
      - Frontend preview: `https://pr-{num}.azurestaticapps.net`
26. **Verifica Feature su Staging/Preview** (*nuovo*)
    - Test manuale su URL staging/preview
    - Verifica integrazione frontend-backend
    - Verifica autenticazione e permessi
    - Test regressione su feature critiche
27. **Code Review & Approval** (*nuovo*)
    - Reviewer approva PR se test OK
    - Richiedi modifiche se necessario (commit su feature branch → re-deploy automatico)
    - Branch protection impedisce merge senza approval
28. **Merge to Main** (*nuovo*)
    - Merge PR quando approved e checks passati
    - Trigger automatico workflow production:
      - `backend-deploy.yml` - Deploy su production slot
      - `frontend-deploy.yml` - Deploy su production environment
    - Feature disponibile in produzione automaticamente

### FASE 7: Verifica Post-Deploy Production
29. Test autenticazione end-to-end su production
30. Verifica CORS su production
31. Controlla Application Insights per errori
32. Smoke test API production
33. **Rollback se necessario** (*nuovo*)
    - Revert commit su main → auto-redeploy versione precedente
    - Oppure swap slot staging/production se disponibile backup

## File Critici da Modificare/Creare

### File Esistenti da Modificare
- `backend/Program.cs` - Abilitare HTTPS redirect, aggiungere health check, Application Insights
- `backend/appsettings.json` - Riferimento configurazione (spostare in App Settings)
- `frontend/src/services/api.ts` - Mapping variabili ambiente
- `docs/azure-deployment.md` - Aggiornare con workflow slots e preview environments

### File Nuovi da Creare (CI/CD con Slots)
- `.github/workflows/backend-pr.yml` - Deploy backend su slot staging per PR
- `.github/workflows/frontend-pr.yml` - Deploy frontend su preview environment per PR
- `.github/workflows/backend-deploy.yml` - Deploy backend su production slot (main)
- `.github/workflows/frontend-deploy.yml` - Deploy frontend su production (main)
- `.github/workflows/pr-validation.yml` - Validazione generale PR (build + test + lint)
- `.github/workflows/comment-pr-urls.yml` - Bot che commenta URL staging/preview su PR
- `frontend/.env.example` - Template variabili ambiente
- `.github/CODEOWNERS` (opzionale) - Auto-assign reviewer
- `.github/pull_request_template.md` (opzionale) - Template PR con checklist

## Verifiche Chiave

### Pre-Deploy Infrastruttura
1. Service Principal creato e testato
2. GitHub Secrets configurati correttamente (production + staging)
3. Deployment slot staging creato e configurato
4. Workflow YAML validati (syntax check)
5. Branch protection rules su main attivi

### Verifica PR Deploy (Staging/Preview)
6. Apertura PR triggera workflow automaticamente
7. Backend deploy su slot staging completa con successo
8. Frontend deploy su preview environment completa
9. Bot commenta PR con URL staging + preview
10. Health check staging slot → 200 OK
11. Preview environment carica senza errori
12. Autenticazione funziona su staging/preview
13. CORS configurato tra preview frontend e staging backend

### Verifica Production Deploy (Post-Merge)
14. Merge PR triggera workflow production automaticamente
15. GitHub Actions workflow production completa con successo
16. Health check production → 200 OK
17. Frontend production carica senza errori console
18. Login Azure AD funziona su production
19. API accessibile da frontend production (verifica network tab)
20. CORS configurato correttamente production
21. Managed Identity connessa a database (no errori di autenticazione)
22. Application Insights riceve telemetria da production

### CI/CD Automation
23. Push su feature branch NON triggera deploy production
24. PR su main triggera solo staging/preview deploy
25. Merge su main triggera production deploy
26. Workflow fallisce se build error o test fail
27. Branch protection impedisce merge senza approval e checks verdi
28. Deployment logs accessibili in GitHub Actions tab
29. PR comment con URL aggiornato ad ogni push su feature branch

## Decisioni

**Architettura:**
- Static Web Apps per frontend (vs App Service) → CDN integrato, deployment automatico
- **App Service tier S1** (minimo) → Necessario per deployment slots, autoscaling disponibile
- Managed Identity per database → Più sicuro di password
- Application Insights → Essenziale per produzione

**CI/CD con Deployment Slots:**
- **GitHub Actions** (vs Azure DevOps) → Integrazione nativa con Static Web Apps
- **Deployment slots per backend** → Staging slot per PR, Production slot per main
- **Preview environments per frontend** → Automatico con Static Web Apps, 1 preview per PR
- **Workflow separati PR vs Production** → Deploy staging su PR, production su merge
- **Service Principal** per auth → Metodo raccomandato Microsoft
- **Branch protection su main** → Impedisce push diretti, richiede approval + checks verdi
- **Auto-deploy su merge** → Continuous deployment, no approval post-merge
- **PR comments con URL** → Bot automatico posta URL staging/preview per test

**Workflow Sviluppo Feature:**
- **Feature branch** → Sviluppo isolato con agenti GitHub
- **PR per ogni feature** → Code review obbligatorio
- **Deploy automatico su staging/preview** → Test in ambiente isolato
- **Merge to main dopo approval** → Deploy automatico in production
- **Rollback via revert commit** → Redeploy automatico versione precedente

## Scope Escluso

- Entity Framework Migrations (usa script SQL manuali per ora)
- Custom domain e SSL certificati custom
- Multi-region deployment / disaster recovery
- Swap automatico slot staging→production (deploy diretto su production da main)
- Code coverage reporting dettagliato (può essere aggiunto dopo)
- Performance testing automatizzato
- Canary deployment o blue-green deployment avanzato

## Dettagli Workflow GitHub Actions

### PR Backend Workflow (backend-pr.yml)
```yaml
name: Deploy Backend to Staging (PR)
on:
  pull_request:
    branches: [main]
    paths: ['backend/**']
jobs:
  deploy-staging:
    - Setup .NET 8
    - dotnet restore, build, test
    - dotnet publish
    - Deploy to App Service slot 'staging' (publish profile staging)
    - Comment PR with staging URL
```

### PR Frontend Workflow (frontend-pr.yml)  
```yaml
name: Deploy Frontend to Preview (PR)
on:
  pull_request:
    branches: [main]
    paths: ['frontend/**']
jobs:
  deploy-preview:
    - Setup Node 18
    - npm install, build (con env vars)
    - Deploy to Static Web Apps (crea preview automaticamente)
    - Comment PR with preview URL
```

### Production Backend Workflow (backend-deploy.yml)
```yaml
name: Deploy Backend to Production
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  deploy-production:
    - Setup .NET 8
    - dotnet restore, build, test
    - dotnet publish
    - Deploy to App Service slot 'production' (publish profile production)
```

### Production Frontend Workflow (frontend-deploy.yml)
```yaml
name: Deploy Frontend to Production
on:
  push:
    branches: [main]
    paths: ['frontend/**']
jobs:
  deploy-production:
    - Setup Node 18
    - npm install, build (con env vars production)
    - Deploy to Static Web Apps production environment
```

### PR Validation Workflow (pr-validation.yml)
```yaml
name: PR Validation
on:
  pull_request:
    branches: [main]
jobs:
  validate-backend:
    - dotnet build, test, lint
  validate-frontend:
    - npm run build, test, lint
  quality-gates:
    - Check coverage threshold
    - Check security vulnerabilities (npm audit, dotnet list package --vulnerable)
```

### GitHub Secrets Necessari
- `AZURE_CREDENTIALS` - Service Principal JSON completo
- `AZURE_WEBAPP_PUBLISH_PROFILE_PRODUCTION` - Download da Azure Portal > App Service > slot production
- `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING` - Download da Azure Portal > App Service > slot staging
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Generato alla creazione Static Web App
- (Opzionale) `AZURE_WEBAPP_NAME`, `RESOURCE_GROUP` - Per comandi az cli in workflow

## Comandi Chiave per Setup CI/CD con Slots

### Crea Service Principal
```bash
az ad sp create-for-rbac --name "github-actions-ticketing" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/ticketing-rg \
  --sdk-auth
```
Output → Copiare JSON completo in GitHub Secret `AZURE_CREDENTIALS`

### Crea Deployment Slot Staging
```bash
# Crea slot staging
az webapp deployment slot create \
  --name ticketing-api-{unique} \
  --resource-group ticketing-rg \
  --slot staging

# Copia configurazione da production a staging
az webapp config appsettings list \
  --name ticketing-api-{unique} \
  --resource-group ticketing-rg \
  --query "[].{name:name, value:value}" \
  --output json > production-settings.json

az webapp config appsettings set \
  --name ticketing-api-{unique} \
  --resource-group ticketing-rg \
  --slot staging \
  --settings @production-settings.json

# Configura FrontendUrl diverso per staging (punta a preview)
az webapp config appsettings set \
  --name ticketing-api-{unique} \
  --resource-group ticketing-rg \
  --slot staging \
  --settings FrontendUrl="https://pr-*.azurestaticapps.net"

# Abilita Managed Identity su staging slot
az webapp identity assign \
  --name ticketing-api-{unique} \
  --resource-group ticketing-rg \
  --slot staging
```

### Scarica Publish Profile Production
```bash
az webapp deployment list-publishing-profiles \
  --name ticketing-api-{unique} \
  --resource-group ticketing-rg \
  --xml > production-profile.xml
```
Output → Copiare contenuto XML in GitHub Secret `AZURE_WEBAPP_PUBLISH_PROFILE_PRODUCTION`

### Scarica Publish Profile Staging
```bash
az webapp deployment list-publishing-profiles \
  --name ticketing-api-{unique} \
  --resource-group ticketing-rg \
  --slot staging \
  --xml > staging-profile.xml
```
Output → Copiare contenuto XML in GitHub Secret `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING`

### Ottieni Static Web Apps Token
```bash
az staticwebapp secrets list \
  --name ticketing-frontend-{unique} \
  --resource-group ticketing-rg \
  --query properties.apiKey -o tsv
```
Output → Copiare in GitHub Secret `AZURE_STATIC_WEB_APPS_API_TOKEN`

### Configura Branch Protection su Main
```bash
# Via GitHub CLI (gh)
gh api repos/{owner}/{repo}/branches/main/protection \
  -X PUT \
  -F required_status_checks[strict]=true \
  -F required_status_checks[contexts][]=PR%20Validation \
  -F required_status_checks[contexts][]=Deploy%20Backend%20to%20Staging%20(PR) \
  -F required_status_checks[contexts][]=Deploy%20Frontend%20to%20Preview%20(PR) \
  -F required_pull_request_reviews[required_approving_review_count]=1 \
  -F enforce_admins=true \
  -F restrictions=null
```
Oppure manualmente: GitHub > Settings > Branches > Add rule su `main`

## Workflow Completo Feature Development

### Esempio Pratico: Aggiungere Filtro Avanzato Tickets

**Step 1: Crea Feature Branch**
```bash
git checkout main
git pull origin main
git checkout -b feature/filtro-avanzato-tickets
```

**Step 2: Sviluppo con Agenti GitHub**
- Usa GitHub Copilot Chat per generare codice
- Agenti suggeriscono implementazione backend + frontend
- Commit incrementali su feature branch
```bash
git add .
git commit -m "feat: aggiunto filtro per data e priorità"
git push origin feature/filtro-avanzato-tickets
```

**Step 3: Apri Pull Request**
```bash
gh pr create --title "Feature: Filtro avanzato tickets" \
  --body "Aggiunge filtro per data creazione e priorità nella lista tickets"
```

**Cosa succede automaticamente:**
- ✅ Workflow `pr-validation.yml` esegue build + test + lint
- ✅ Workflow `backend-pr.yml` deploya su slot staging
- ✅ Workflow `frontend-pr.yml` deploya su preview environment
- 💬 Bot commenta PR con URL:
  ```
  🚀 Deployment completato!
  
  Backend Staging: https://ticketing-api-pietro-staging.azurewebsites.net
  Frontend Preview: https://pr-42.azurestaticapps.net
  
  Test la feature e approva quando pronto!
  ```

**Step 4: Test su Staging/Preview**
- Apri URL preview nel browser
- Testa filtro avanzato con dati reali
- Verifica integrazione backend-frontend
- Verifica autenticazione Azure AD
- Test regressione: funzionalità esistenti ancora funzionanti?

**Step 5: Code Review**
- Reviewer esamina codice
- Verifica test su staging/preview
- Richiede modifiche se necessario:
  ```bash
  # Su feature branch
  git add .
  git commit -m "fix: corretto bug filtro data"
  git push origin feature/filtro-avanzato-tickets
  ```
  → Re-deploy automatico su staging/preview

**Step 6: Approval & Merge**
- Reviewer approva PR
- Tutti i checks sono verdi ✅
- Merge PR su main (bottone GitHub o CLI):
  ```bash
  gh pr merge --squash --delete-branch
  ```

**Cosa succede automaticamente:**
- 🚀 Workflow `backend-deploy.yml` deploya su production
- 🚀 Workflow `frontend-deploy.yml` deploya su production
- 🗑️ Preview environment viene eliminato automaticamente
- ✅ Feature disponibile in produzione entro 2-5 minuti

**Step 7: Verifica Production**
- Apri https://ticketing-frontend-pietro.azurestaticapps.net
- Testa feature in produzione
- Monitora Application Insights per errori
- Se problemi: revert commit e auto-redeploy

**Step 8: Rollback (se necessario)**
```bash
git revert HEAD
git push origin main
```
→ Auto-redeploy versione precedente in 2-5 minuti

## Domande Aperte (Aggiornate)

1. **Nome univoco per risorse Azure** - Che suffisso vuoi usare? (es. `ticketing-api-pietro`, `ticketing-frontend-prod`)
2. **Numero minimo di approvazioni PR** - 1 reviewer sufficiente o 2 per feature critiche?
3. **Database migrations** - EF Migrations automatizzate in workflow o script SQL manuali?
4. **Monitoring alert** - Configurare alert su Application Insights subito (failure rate, response time)?
5. **Key Vault** - Integrare subito o dopo primo deploy funzionante?
6. **GitHub Copilot Workspace** - Vuoi configurare agenti automatici per issue tracking → feature branch?
7. **Swap slot vs Direct Deploy** - Preferisci swap staging→production (zero downtime) o deploy diretto su production?
8. **Auto-delete feature branch** - Eliminare branch automaticamente dopo merge o mantenerli?

## Vantaggi Strategia Deployment Slots + Preview

✅ **Test Isolato** - Ogni PR ha ambiente dedicato, no conflitti tra feature  
✅ **Review Visivo** - Reviewer testa feature live prima di approvare  
✅ **Zero Downtime** - Preview e staging non impattano production  
✅ **Rollback Rapido** - Revert commit = auto-redeploy in minuti  
✅ **Automazione Completa** - Da PR a production senza intervento manuale  
✅ **Tracciabilità** - Ogni deploy linkato a commit/PR, audit completo  
✅ **Feedback Rapido** - Developer vede feature live entro 2-5 minuti da push  
✅ **Sicurezza** - Branch protection impedisce errori umani  

## Costi Stimati (Azure)

- **App Service Plan S1** (con 1 slot staging): ~€60/mese
- **Static Web Apps Standard** (preview environments inclusi): ~€8/mese
- **Application Insights** (5GB/mese gratis): €0-5/mese
- **Microsoft Fabric SQL**: Secondo piano esistente (già pagato)
- **GitHub Actions** (2000 min/mese gratis): €0 per repo pubblici

**Totale stimato**: ~€70-75/mese
