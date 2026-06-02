export interface TicketAperto {
  id?: number;
  titolo: string;
  descrizione?: string;
  competenzaId?: number;
  macroCausaId?: number;
  causaId?: number;
  stato?: string;
  priorita?: string;
  dataApertura?: Date;
  dataChiusura?: Date;
  assegnatoA?: string;
  creatoDa?: string;
  creatoIl?: Date;
  modificatoDa?: string;
  modificatoIl?: Date;
}

export interface Competenza {
  id: number;
  nome: string;
  descrizione?: string;
  attivo: boolean;
  creatoIl: Date;
}

export interface MacroCausa {
  id: number;
  nome: string;
  descrizione?: string;
  attivo: boolean;
  creatoIl: Date;
}

export interface Causa {
  id: number;
  macroCausaId: number;
  nome: string;
  descrizione?: string;
  attivo: boolean;
  creatoIl: Date;
}

export interface Commento {
  id?: number;
  ticketId: number;
  testo: string;
  autore?: string;
  creatoIl?: Date;
}
