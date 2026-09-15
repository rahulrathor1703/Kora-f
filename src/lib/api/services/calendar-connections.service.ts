import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CalendarConnection,
  CalendarConnectionAvailability,
  CalendarConnectionProvider,
} from '@/lib/crm/meetings/types';

export const calendarConnectionsService = {
  listConnections() {
    return apiClient.get<CalendarConnection[]>(ENDPOINTS.calendarConnections.list);
  },

  getAvailability() {
    return apiClient.get<CalendarConnectionAvailability>(
      ENDPOINTS.calendarConnections.availability,
    );
  },

  disconnect(provider: CalendarConnectionProvider) {
    return apiClient.delete<void>(
      ENDPOINTS.calendarConnections.disconnect(provider),
    );
  },
};
