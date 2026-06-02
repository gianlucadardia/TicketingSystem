# Schema Database

## Connessione Database

**Connection String (Fabric SQL)**:
```
Server=jxbqdy74rvpujmzpttqqewlehe-xs5s6bwrjy7eloim5vh5x46hf4.database.fabric.microsoft.com,1433;
Database={UserInputDatabase-df5017e9-bab5-4c85-9253-d478ef679db4};
Encrypt=true;
TrustServerCertificate=false;
Authentication=Active Directory Interactive
```

## Tabelle

### ticket_aperti (Tabella Principale)

```sql
CREATE TABLE ticket_aperti (
    id INT PRIMARY KEY IDENTITY(1,1),
    titolo NVARCHAR(200) NOT NULL,
    descrizione NVARCHAR(MAX),
    competenza_id INT FOREIGN KEY REFERENCES competenza(id),
    macro_causa_id INT FOREIGN KEY REFERENCES macro_causa(id),
    causa_id INT FOREIGN KEY REFERENCES causa(id),
    stato NVARCHAR(50) DEFAULT 'Aperto',
    priorita NVARCHAR(20),
    data_apertura DATETIME2 DEFAULT GETDATE(),
    data_chiusura DATETIME2 NULL,
    assegnato_a NVARCHAR(100),
    creato_da NVARCHAR(100) NOT NULL,
    creato_il DATETIME2 DEFAULT GETDATE(),
    modificato_da NVARCHAR(100),
    modificato_il DATETIME2
);

CREATE INDEX idx_ticket_competenza ON ticket_aperti(competenza_id);
CREATE INDEX idx_ticket_stato ON ticket_aperti(stato);
CREATE INDEX idx_ticket_data_apertura ON ticket_aperti(data_apertura);
```

### competenza (Lookup Table)

```sql
CREATE TABLE competenza (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome NVARCHAR(100) NOT NULL UNIQUE,
    descrizione NVARCHAR(500),
    attivo BIT DEFAULT 1,
    creato_il DATETIME2 DEFAULT GETDATE()
);

-- Dati esempio
INSERT INTO competenza (nome, descrizione) VALUES 
    ('IT Support', 'Supporto tecnico generale'),
    ('Networking', 'Problemi di rete e connettività'),
    ('Software', 'Applicazioni e software'),
    ('Hardware', 'Dispositivi fisici'),
    ('Security', 'Sicurezza informatica');
```

### macro_causa (Lookup Table - Gerarchia Livello 1)

```sql
CREATE TABLE macro_causa (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome NVARCHAR(100) NOT NULL UNIQUE,
    descrizione NVARCHAR(500),
    attivo BIT DEFAULT 1,
    creato_il DATETIME2 DEFAULT GETDATE()
);

-- Dati esempio
INSERT INTO macro_causa (nome, descrizione) VALUES 
    ('Problema Tecnico', 'Malfunzionamenti tecnici'),
    ('Errore Utente', 'Errori operativi utente'),
    ('Richiesta Servizio', 'Richieste di nuovi servizi'),
    ('Configurazione', 'Problemi di configurazione'),
    ('Manutenzione', 'Interventi di manutenzione');
```

### causa (Lookup Table - Gerarchia Livello 2)

```sql
CREATE TABLE causa (
    id INT PRIMARY KEY IDENTITY(1,1),
    macro_causa_id INT NOT NULL FOREIGN KEY REFERENCES macro_causa(id) ON DELETE CASCADE,
    nome NVARCHAR(100) NOT NULL,
    descrizione NVARCHAR(500),
    attivo BIT DEFAULT 1,
    creato_il DATETIME2 DEFAULT GETDATE(),
    UNIQUE(macro_causa_id, nome)
);

CREATE INDEX idx_causa_macro ON causa(macro_causa_id);

-- Dati esempio
INSERT INTO causa (macro_causa_id, nome, descrizione) VALUES 
    (1, 'Crash applicazione', 'Applicazione si chiude inaspettatamente'),
    (1, 'Performance lenta', 'Sistema o applicazione lenta'),
    (2, 'Credenziali errate', 'Password o username sbagliati'),
    (2, 'Procedura non seguita', 'Utente non ha seguito la procedura'),
    (3, 'Nuovo accesso', 'Richiesta nuovo accesso sistema'),
    (3, 'Upgrade licenza', 'Richiesta upgrade licenza software');
```

### commenti (Tabella Relazionale)

```sql
CREATE TABLE commenti (
    id INT PRIMARY KEY IDENTITY(1,1),
    ticket_id INT NOT NULL FOREIGN KEY REFERENCES ticket_aperti(id) ON DELETE CASCADE,
    testo NVARCHAR(MAX) NOT NULL,
    autore NVARCHAR(100) NOT NULL,
    creato_il DATETIME2 DEFAULT GETDATE(),
    modificato_il DATETIME2
);

CREATE INDEX idx_commenti_ticket ON commenti(ticket_id);
CREATE INDEX idx_commenti_data ON commenti(creato_il);
```

## Relazioni

```
ticket_aperti
    ├─> competenza (N:1)
    ├─> macro_causa (N:1)
    ├─> causa (N:1)
    └─> commenti (1:N)

causa
    └─> macro_causa (N:1)
```

## Note Implementazione

- Usare **DefaultAzureCredential** per autenticazione senza password
- Implementare **soft delete** con campo `attivo` per lookup tables
- Indici su foreign keys e colonne usate per filtri
- `creato_da` e `modificato_da` popolati da Azure AD user identity
