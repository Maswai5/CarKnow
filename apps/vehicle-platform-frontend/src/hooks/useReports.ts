import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { PublicReport } from '../api/types';

export function fetchPublicReport(identifier: string) {
  return api
    .get(`/reports/public/${encodeURIComponent(identifier)}`)
    .then((res) => res.data.report as PublicReport);
}

export function usePublicReport(identifier: string | null, enabled = true) {
  return useQuery(['report', 'public', identifier], () => fetchPublicReport(identifier || ''), {
    enabled: !!identifier && enabled,
    retry: 1,
    staleTime: 1000 * 60,
  });
}