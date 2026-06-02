import { apiClient } from './api';
import { TicketAperto } from '../types/models';

export const ticketService = {
  getAll: async (): Promise<TicketAperto[]> => {
    const response = await apiClient.get<TicketAperto[]>('/tickets');
    return response.data;
  },

  getById: async (id: number): Promise<TicketAperto> => {
    const response = await apiClient.get<TicketAperto>(`/tickets/${id}`);
    return response.data;
  },

  create: async (ticket: Partial<TicketAperto>): Promise<TicketAperto> => {
    const response = await apiClient.post<TicketAperto>('/tickets', ticket);
    return response.data;
  },

  update: async (id: number, ticket: Partial<TicketAperto>): Promise<void> => {
    // Mappa le proprietà camelCase a PascalCase per il backend C#
    const backendTicket = {
      Id: id,
      Titolo: ticket.titolo,
      Descrizione: ticket.descrizione,
      CompetenzaId: ticket.competenzaId,
      MacroCausaId: ticket.macroCausaId,
      CausaId: ticket.causaId,
      Stato: ticket.stato,
      Priorita: ticket.priorita,
      DataApertura: ticket.dataApertura,
      DataChiusura: ticket.dataChiusura,
      AssegnatoA: ticket.assegnatoA,
      CreatoDa: ticket.creatoDa,
      CreatoIl: ticket.creatoIl,
      ModificatoDa: ticket.modificatoDa,
      ModificatoIl: ticket.modificatoIl
    };
    await apiClient.put(`/tickets/${id}`, backendTicket);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tickets/${id}`);
  },

  search: async (query: string, stato?: string, competenzaId?: number): Promise<TicketAperto[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (stato) params.append('stato', stato);
    if (competenzaId) params.append('competenzaId', competenzaId.toString());
    
    const response = await apiClient.get<TicketAperto[]>(`/tickets/search?${params}`);
    return response.data;
  }
};
