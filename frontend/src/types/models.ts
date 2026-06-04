export interface TicketAperto {
  id?: number;
  codiceTicket?: string;
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
  competenza?: Competenza;
  macroCausa?: MacroCausa;
  causa?: Causa;
  commenti?: Commento[];
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
  codiceTicket?: string;
  testo: string;
  autore?: string;
  creatoIl?: Date;
  modificatoIl?: Date;
}
