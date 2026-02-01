import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VehicleLookup from '../pages/VehicleLookup';
import api from '../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('VehicleLookup', () => {
  beforeEach(() => {
    (api.get as any).mockReset();
  });

  it('successfully looks up and shows a report', async () => {
    (api.get as any).mockResolvedValue({ data: { report: { vin: 'VIN123', make: 'Toyota', model: 'Corolla' } } });

    renderWithProviders(<VehicleLookup />);

    fireEvent.change(screen.getByPlaceholderText(/license plate or vin/i), { target: { value: 'VIN123' } });
    fireEvent.click(screen.getByRole('button', { name: /lookup/i }));

    await waitFor(() => expect(screen.getByText(/toyota/i)).toBeTruthy());
    expect(screen.getByText(/vin123/i)).toBeTruthy();
  });

  it('shows an error when lookup fails', async () => {
    (api.get as any).mockRejectedValue(new Error('Not found'));

    renderWithProviders(<VehicleLookup />);

    fireEvent.change(screen.getByPlaceholderText(/license plate or vin/i), { target: { value: 'UNKNOWN' } });
    fireEvent.click(screen.getByRole('button', { name: /lookup/i }));

    await waitFor(() => expect(screen.getByText(/lookup failed|not found/i)).toBeTruthy());
  });
});