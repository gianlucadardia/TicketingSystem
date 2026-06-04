-- Migration: AddCodiceTicket
-- Aggiunge il campo CodiceTicket alle tabelle ticket_aperti e commenti

BEGIN TRANSACTION;

-- Aggiungi colonna codice_ticket alla tabella ticket_aperti
ALTER TABLE Ticketing.ticket_aperti
ADD codice_ticket NVARCHAR(20) NULL;

-- Popola i codici ticket esistenti con formato TICK-XXXX
WITH NumberedTickets AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM Ticketing.ticket_aperti
)
UPDATE Ticketing.ticket_aperti
SET codice_ticket = 'TICK-' + RIGHT('0000' + CAST((SELECT rn FROM NumberedTickets WHERE NumberedTickets.id = ticket_aperti.id) AS VARCHAR), 4)
FROM Ticketing.ticket_aperti;

-- Rendi la colonna NOT NULL dopo averla popolata
ALTER TABLE Ticketing.ticket_aperti
ALTER COLUMN codice_ticket NVARCHAR(20) NOT NULL;

-- Crea indice unico su codice_ticket
CREATE UNIQUE INDEX idx_ticket_codice ON Ticketing.ticket_aperti(codice_ticket);

-- Aggiungi colonna codice_ticket alla tabella commenti
ALTER TABLE Ticketing.commenti
ADD codice_ticket NVARCHAR(20) NULL;

-- Popola i codici ticket nei commenti esistenti
UPDATE c
SET c.codice_ticket = t.codice_ticket
FROM Ticketing.commenti c
INNER JOIN Ticketing.ticket_aperti t ON c.ticket_id = t.id;

-- Rendi la colonna NOT NULL dopo averla popolata
ALTER TABLE Ticketing.commenti
ALTER COLUMN codice_ticket NVARCHAR(20) NOT NULL;

-- Crea indice su codice_ticket nella tabella commenti
CREATE INDEX idx_commenti_codice_ticket ON Ticketing.commenti(codice_ticket);

COMMIT TRANSACTION;

PRINT 'Migration AddCodiceTicket completed successfully';
