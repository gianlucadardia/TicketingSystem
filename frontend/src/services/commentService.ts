import { apiClient } from './api';
import { Commento } from '../types/models';

export const commentService = {
  getByTicketId: async (ticketId: number): Promise<Commento[]> => {
    const response = await apiClient.get<Commento[]>(`/commenti/ticket/${ticketId}`);
    return response.data;
  },

  getAll: async (query?: string): Promise<Commento[]> => {
    const url = query?.trim()
      ? `/commenti/search?query=${encodeURIComponent(query.trim())}`
      : '/commenti';

    const response = await apiClient.get<Commento[]>(url);
    return response.data;
  },

  create: async (commento: Pick<Commento, 'ticketId' | 'testo'>): Promise<Commento> => {
    const response = await apiClient.post<Commento>('/commenti', commento);
    return response.data;
  },

  update: async (commento: Commento): Promise<void> => {
    await apiClient.put(`/commenti/${commento.id}`, commento);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/commenti/${id}`);
  }
};