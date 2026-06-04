# Implementazione Commenti - Istruzioni per il Completamento

## ✅ Modifiche Completate

### Backend
1. **Models aggiornati**:
   - `TicketAperto`: Aggiunto campo `CodiceTicket` (string, max 20 caratteri)
   - `Commento`: Aggiunto campo `CodiceTicket` (string, max 20 caratteri)

2. **ApplicationDbContext configurato**:
   - Configurazione CodiceTicket per entrambe le entità
   - Indice univoco su `ticket_aperti.codice_ticket`
   - Indice su `commenti.codice_ticket`

3. **Controllers aggiornati**:
   - `TicketsController.CreateTicket`: Genera automaticamente CodiceTicket in formato "TICK-0001"
   - `CommentiController.CreateCommento`: Popola automaticamente CodiceTicket dal ticket
   - Nuovi endpoint aggiunti:
     - `GET /api/commenti/codice/{codiceTicket}` - Ottiene commento per codice ticket
     - `GET /api/commenti/search?query={text}` - Cerca nei commenti (testo, autore, codice)
     - `GET /api/commenti` - Ottiene tutti i commenti

### Frontend
1. **Types aggiornati** (`models.ts`):
   - `TicketAperto`: Aggiunto `codiceTicket?: string` e `commenti?: Commento[]`
   - `Commento`: Aggiunto `codiceTicket?: string` e `modificatoIl?: Date`

2. **Nuovi componenti creati**:
   - `CommentModal.tsx`: Modal per visualizzare/creare/modificare commento di un ticket
   - `CommentsTable.tsx`: Tabella completa con CRUD e ricerca commenti

3. **TicketTable aggiornato**:
   - Aggiunta colonna con icona commenti (💬 piena se presente, vuota se assente)
   - Click su icona apre CommentModal

4. **App.tsx aggiornato**:
   - Aggiunto React Router con menu laterale (Sider)
   - Menu con due voci: "Tickets" e "Commenti"
   - Routing configurato per entrambe le pagine

## 📋 Passaggi Rimanenti per il Completamento

### 1. Eseguire lo Script SQL sul Database

Lo script di migrazione è stato creato in `backend/Migrations/AddCodiceTicket.sql`.

**IMPORTANTE**: Devi eseguire questo script manualmente sul database Fabric per aggiungere le colonne CodiceTicket.

#### Opzioni per eseguire lo script:

**Opzione A: Azure Data Studio**
1. Apri Azure Data Studio
2. Connettiti al database Fabric:
   - Server: `jxbqdy74rvpujmzpttqqewlehe-xs5s6bwrjy7eloim5vh5x46hf4.database.fabric.microsoft.com,1433`
   - Database: `UserInputDatabase-df5017e9-bab5-4c85-9253-d478ef679db4`
   - Authentication: Azure Active Directory
3. Apri il file `backend/Migrations/AddCodiceTicket.sql`
4. Esegui lo script

**Opzione B: SQL Server Management Studio (SSMS)**
1. Apri SSMS
2. Connettiti al server Fabric
3. Apri ed esegui lo script

**Opzione C: Azure Portal**
1. Vai al tuo workspace Fabric
2. Apri SQL Query Editor
3. Copia e incolla il contenuto dello script
4. Esegui

### 2. Avviare il Backend

```bash
cd backend
dotnet run
```

Il backend sarà disponibile su: `http://localhost:5085`
Swagger UI: `http://localhost:5085/swagger`

### 3. Avviare il Frontend

```bash
cd frontend
npm install  # Se non hai già installato le dipendenze
npm start
```

Il frontend sarà disponibile su: `http://localhost:3000`

## 🎯 Funzionalità Implementate

### Gestione Commenti da Tabella Ticket
- **Icona commenti**: Nella tabella ticket, ogni riga mostra un'icona:
  - 💬 Piena (blu) = commento presente
  - 💬 Vuota (grigia) = nessun commento
- **Click sull'icona**: Apre modal per:
  - Visualizzare commento esistente
  - Creare nuovo commento
  - Modificare commento esistente
  - Eliminare commento

### Pagina Commenti Dedicata
- **Menu laterale**: Nuova voce "Commenti" nel menu
- **Tabella commenti**: Visualizza tutti i commenti con:
  - Codice Ticket (cliccabile per navigare al ticket)
  - Testo del commento
  - Autore
  - Data creazione
  - Azioni (Modifica, Elimina)
- **Ricerca**: Campo di ricerca per filtrare per testo, codice ticket, o autore

### Auto-generazione CodiceTicket
- Formato: `TICK-0001`, `TICK-0002`, etc.
- Generato automaticamente alla creazione del ticket
- Sequenziale basato sull'ID del ticket

### Relazioni
- Ogni commento è legato a un ticket tramite:
  - `TicketId` (int, FK)
  - `CodiceTicket` (string, più user-friendly)
- Massimo 1 commento per ticket

## 🔍 Testing Checklist

Dopo aver completato i passaggi:

1. **Backend**:
   - [ ] Script SQL eseguito senza errori
   - [ ] Backend avviato correttamente
   - [ ] Swagger mostra nuovi endpoint commenti
   - [ ] Creazione ticket genera CodiceTicket

2. **Frontend**:
   - [ ] Menu laterale visibile con Tickets e Commenti
   - [ ] Tabella ticket mostra icone commenti
   - [ ] Click su icona commenti apre modal
   - [ ] Creazione commento funziona
   - [ ] Modifica commento funziona
   - [ ] Eliminazione commento funziona
   - [ ] Pagina Commenti accessibile
   - [ ] Ricerca commenti funziona
   - [ ] Codice ticket cliccabile (TODO: implementare navigazione)

## 🚧 Miglioramenti Futuri (Opzionali)

1. **Navigazione codice ticket**: Nel CommentsTable, il click sul codice ticket potrebbe:
   - Aprire modal con dettagli ticket
   - Navigare alla pagina ticket con filtro per quel codice

2. **Notifiche in tempo reale**: SignalR per notificare nuovi commenti

3. **Rich text editor**: Per commenti con formattazione

4. **Allegati**: Possibilità di allegare file ai commenti

5. **Cronologia modifiche**: Tracciare tutte le modifiche ai commenti

## ⚠️ Note Importanti

- Lo script SQL è **idempotente**: popola automaticamente i CodiceTicket per i ticket esistenti
- I commenti esistenti vengono aggiornati automaticamente con il CodiceTicket del ticket associato
- La relazione TicketId rimane per mantenere la Foreign Key constraint
- Il backend è configurato per .NET 8, NON usare comandi .NET 9+ come `dotnet ef`

## 📞 Troubleshooting

### Errore: "Column 'codice_ticket' does not exist"
- Lo script SQL non è stato eseguito o è fallito
- Verifica la connessione al database
- Controlla i log SQL per errori

### Errore: "HostAbortedException" durante dotnet ef migrations
- Questo è normale con l'autenticazione Azure AD
- Usa lo script SQL manuale fornito invece di migrations

### Frontend non si connette al backend
- Verifica che il backend sia in esecuzione su porta 5085
- Controlla la configurazione CORS in `appsettings.json`
- Verifica l'autenticazione Azure AD

### Icone commenti non si aggiornano
- Il backend include automaticamente la collection `Commenti` nel GET tickets
- Verifica nella risposta API se `commenti` è presente
- Controlla la console browser per errori

## ✨ Riepilogo Architettura

### Flusso Creazione Ticket
1. User crea ticket → Backend genera CodiceTicket
2. CodiceTicket salvato in formato "TICK-XXXX"
3. Ticket visibile in tabella con icona commenti vuota

### Flusso Creazione Commento
1. User click su icona commenti → Apre modal
2. User scrive commento → Invia
3. Backend:
   - Riceve TicketId
   - Recupera CodiceTicket dal ticket
   - Salva commento con entrambi i riferimenti
4. Frontend aggiorna icona a "piena"

### Flusso Ricerca Commenti
1. User naviga a pagina Commenti
2. Digita query di ricerca
3. Backend cerca in: testo, CodiceTicket, autore
4. Risultati mostrati in tabella ordinati per data

---

**Implementazione completata da GitHub Copilot** 🤖
