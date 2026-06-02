import { apiClient } from './api';
import { Competenza, MacroCausa, Causa } from '../types/models';

export const lookupService = {
  // Competenze
  getAllCompetenze: async (): Promise<Competenza[]> => {
    const response = await apiClient.get<Competenza[]>('/competenze');
    return response.data;
  },

  // Macro Cause
  getAllMacroCause: async (): Promise<MacroCausa[]> => {
    const response = await apiClient.get<MacroCausa[]>('/macrocause');
    return response.data;
  },

  // Cause
  getAllCause: async (): Promise<Causa[]> => {
    const response = await apiClient.get<Causa[]>('/cause');
    return response.data;
  },

  getCauseByMacroCausa: async (macroCausaId: number): Promise<Causa[]> => {
    const response = await apiClient.get<Causa[]>(`/cause/bymacrocausa/${macroCausaId}`);
    return response.data;
  }
};
