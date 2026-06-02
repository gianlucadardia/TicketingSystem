-- Script di Verifica e Popolamento Database
-- Esegui questo script sul database Fabric per creare le tabelle e i dati di test

-- 1. Verifica se le tabelle esistono
IF OBJECT_ID('competenza', 'U') IS NULL
BEGIN
    CREATE TABLE competenza (
        id INT PRIMARY KEY IDENTITY(1,1),
        nome NVARCHAR(100) NOT NULL UNIQUE,
        descrizione NVARCHAR(500),
        attivo BIT DEFAULT 1,
        creato_il DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Tabella competenza creata';
END
ELSE
    PRINT 'Tabella competenza già esistente';

IF OBJECT_ID('macro_causa', 'U') IS NULL
BEGIN
    CREATE TABLE macro_causa (
        id INT PRIMARY KEY IDENTITY(1,1),
        nome NVARCHAR(100) NOT NULL UNIQUE,
        descrizione NVARCHAR(500),
        attivo BIT DEFAULT 1,
        creato_il DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Tabella macro_causa creata';
END
ELSE
    PRINT 'Tabella macro_causa già esistente';

IF OBJECT_ID('causa', 'U') IS NULL
BEGIN
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
    PRINT 'Tabella causa creata';
END
ELSE
    PRINT 'Tabella causa già esistente';

IF OBJECT_ID('ticket_aperti', 'U') IS NULL
BEGIN
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
    PRINT 'Tabella ticket_aperti creata';
END
ELSE
    PRINT 'Tabella ticket_aperti già esistente';

IF OBJECT_ID('commenti', 'U') IS NULL
BEGIN
    CREATE TABLE commenti (
        id INT PRIMARY KEY IDENTITY(1,1),
        ticket_id INT NOT NULL FOREIGN KEY REFERENCES ticket_aperti(id) ON DELETE CASCADE,
        testo NVARCHAR(MAX) NOT NULL,
        autore NVARCHAR(100),
        creato_il DATETIME2 DEFAULT GETDATE()
    );
    
    CREATE INDEX idx_commenti_ticket ON commenti(ticket_id);
    PRINT 'Tabella commenti creata';
END
ELSE
    PRINT 'Tabella commenti già esistente';

-- 2. Popola le tabelle di lookup se vuote

-- Competenze
IF NOT EXISTS (SELECT 1 FROM competenza)
BEGIN
    INSERT INTO competenza (nome, descrizione) VALUES 
        ('IT Support', 'Supporto tecnico generale'),
        ('Networking', 'Problemi di rete e connettività'),
        ('Software', 'Applicazioni e software'),
        ('Hardware', 'Dispositivi fisici'),
        ('Security', 'Sicurezza informatica'),
        ('Database', 'Gestione e manutenzione database'),
        ('Cloud Services', 'Servizi cloud Azure/AWS'),
        ('Help Desk', 'Assistenza utenti');
    PRINT 'Dati competenza inseriti';
END

-- Macro Cause
IF NOT EXISTS (SELECT 1 FROM macro_causa)
BEGIN
    INSERT INTO macro_causa (nome, descrizione) VALUES 
        ('Problema Tecnico', 'Malfunzionamenti tecnici'),
        ('Errore Utente', 'Errori operativi utente'),
        ('Richiesta Servizio', 'Richieste di nuovi servizi'),
        ('Configurazione', 'Problemi di configurazione'),
        ('Manutenzione', 'Interventi di manutenzione'),
        ('Performance', 'Problemi di performance'),
        ('Sicurezza', 'Problemi di sicurezza');
    PRINT 'Dati macro_causa inseriti';
END

-- Cause (dipendono da macro_causa)
IF NOT EXISTS (SELECT 1 FROM causa)
BEGIN
    DECLARE @probTecId INT, @errUteId INT, @richServId INT, @confId INT, @manutId INT, @perfId INT, @sicId INT;
    
    SELECT @probTecId = id FROM macro_causa WHERE nome = 'Problema Tecnico';
    SELECT @errUteId = id FROM macro_causa WHERE nome = 'Errore Utente';
    SELECT @richServId = id FROM macro_causa WHERE nome = 'Richiesta Servizio';
    SELECT @confId = id FROM macro_causa WHERE nome = 'Configurazione';
    SELECT @manutId = id FROM macro_causa WHERE nome = 'Manutenzione';
    SELECT @perfId = id FROM macro_causa WHERE nome = 'Performance';
    SELECT @sicId = id FROM macro_causa WHERE nome = 'Sicurezza';

    INSERT INTO causa (macro_causa_id, nome, descrizione) VALUES 
        -- Problema Tecnico
        (@probTecId, 'Crash applicazione', 'Applicazione si chiude inaspettatamente'),
        (@probTecId, 'Performance lenta', 'Sistema o applicazione lenta'),
        (@probTecId, 'Errore di sistema', 'Errore generico del sistema'),
        (@probTecId, 'Bug software', 'Comportamento non previsto del software'),
        
        -- Errore Utente
        (@errUteId, 'Password dimenticata', 'Utente ha dimenticato la password'),
        (@errUteId, 'Procedura non seguita', 'Utente non ha seguito la procedura corretta'),
        (@errUteId, 'Formazione necessaria', 'Utente necessita di formazione'),
        
        -- Richiesta Servizio
        (@richServId, 'Nuovo account', 'Richiesta creazione nuovo account'),
        (@richServId, 'Nuovo software', 'Richiesta installazione software'),
        (@richServId, 'Accesso a risorsa', 'Richiesta accesso a risorsa specifica'),
        (@richServId, 'Hardware nuovo', 'Richiesta nuovo hardware'),
        
        -- Configurazione
        (@confId, 'Configurazione errata', 'Configurazione non corretta'),
        (@confId, 'Impostazioni mancanti', 'Impostazioni non configurate'),
        (@confId, 'Conflitto configurazione', 'Conflitto tra configurazioni'),
        
        -- Manutenzione
        (@manutId, 'Aggiornamento richiesto', 'Necessario aggiornamento'),
        (@manutId, 'Backup fallito', 'Processo di backup non riuscito'),
        (@manutId, 'Pulizia disco', 'Necessaria pulizia spazio disco'),
        
        -- Performance
        (@perfId, 'CPU alta', 'Utilizzo CPU elevato'),
        (@perfId, 'Memoria insufficiente', 'RAM insufficiente'),
        (@perfId, 'Disco pieno', 'Spazio disco esaurito'),
        (@perfId, 'Network lento', 'Rete lenta o instabile'),
        
        -- Sicurezza
        (@sicId, 'Virus rilevato', 'Malware o virus rilevato'),
        (@sicId, 'Tentativo accesso non autorizzato', 'Rilevato accesso sospetto'),
        (@sicId, 'Certificato scaduto', 'Certificato SSL/TLS scaduto');
        
    PRINT 'Dati causa inseriti';
END

-- 3. Verifica dati
SELECT 'COMPETENZE' AS Tabella, COUNT(*) AS Righe FROM competenza
UNION ALL
SELECT 'MACRO_CAUSE' AS Tabella, COUNT(*) AS Righe FROM macro_causa
UNION ALL
SELECT 'CAUSE' AS Tabella, COUNT(*) AS Righe FROM causa
UNION ALL
SELECT 'TICKET_APERTI' AS Tabella, COUNT(*) AS Righe FROM ticket_aperti
UNION ALL
SELECT 'COMMENTI' AS Tabella, COUNT(*) AS Righe FROM commenti;

PRINT 'Script completato con successo!';
