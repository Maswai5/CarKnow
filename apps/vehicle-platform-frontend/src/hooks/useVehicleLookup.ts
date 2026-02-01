import { useState } from 'react';
import api from '../lib/api';

export function useVehicleLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);

  async function lookup(identifier: string) {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await api.get(`/reports/public/${encodeURIComponent(identifier)}`);
      setReport(res.data.report);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }

  return { lookup, loading, error, report };
}
