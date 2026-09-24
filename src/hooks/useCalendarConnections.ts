'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { calendarConnectionsService } from '@/lib/api/services/calendar-connections.service';
import type { CalendarConnectionProvider } from '@/lib/crm/meetings/types';

export function useCalendarConnections() {
  const orgScopeKey = 'calendar.connections';

  const query = useApiQuery(`${orgScopeKey}.list`, () =>
    calendarConnectionsService.listConnections(),
  );

  const availabilityQuery = useApiQuery(`${orgScopeKey}.availability`, () =>
    calendarConnectionsService.getAvailability(),
  );

  const { mutate: disconnectMutate, isLoading: isDisconnecting } =
    useApiMutation((provider: CalendarConnectionProvider) =>
      calendarConnectionsService.disconnect(provider),
    );

  const disconnect = useCallback(
    async (provider: CalendarConnectionProvider) => {
      await disconnectMutate(provider);
      await query.refetch();
    },
    [disconnectMutate, query],
  );

  return {
    connections: query.data ?? [],
    availability: availabilityQuery.data,
    isLoading: query.isLoading || availabilityQuery.isLoading,
    refetch: query.refetch,
    disconnect,
    isDisconnecting,
  };
}
