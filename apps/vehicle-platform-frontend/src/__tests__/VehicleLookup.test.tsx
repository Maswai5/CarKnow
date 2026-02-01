import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VehicleLookup from '../pages/VehicleLookup';
import api from '../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));

import { cleanup } from '@testing-library/react';

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  qc.mount();
  return render(<QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>);
}

afterEach(() => {
  cleanup();
});

describe('VehicleLookup', () => {
  beforeEach(() => {
    (api.get as any).mockReset();
  });

  it('successfully looks up and shows a report', async () => {
    (api.get as any).mockResolvedValue({ data: { report: { vin: 'VIN123', make: 'Toyota', model: 'Corolla' } } });

    renderWithProviders(<VehicleLookup />);

    const inputs = screen.getAllByPlaceholderText(/vin|plate|enter vin/i);
    fireEvent.change(inputs[0], { target: { value: 'VIN123' } });
    fireEvent.click(screen.getByRole('button', { name: /lookup/i }));

    await waitFor(() => expect(screen.getAllByText(/toyota/i).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/vin123/i).length).toBeGreaterThan(0);
  });

  it('shows an error when lookup fails', async () => {
    (api.get as any).mockRejectedValue(new Error('Not found'));

    renderWithProviders(<VehicleLookup />);

    const inputs = screen.getAllByPlaceholderText(/vin|plate|enter vin/i);
    fireEvent.change(inputs[0], { target: { value: 'UNKNOWN' } });
    fireEvent.click(screen.getByRole('button', { name: /lookup/i }));

    await waitFor(() => expect(screen.queryByText(/lookup failed|not found/i)).toBeTruthy());
  });
});