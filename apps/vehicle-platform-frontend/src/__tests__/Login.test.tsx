import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import api from '../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../lib/api', () => ({ default: { post: vi.fn() } }));

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    (api.post as any).mockReset();
  });

  it('successful login sets token', async () => {
    (api.post as any).mockResolvedValue({ data: { token: 'test-token' } });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email or username/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(localStorage.getItem('carknow_token')).toBe('test-token'));
  });

  it('shows error when login fails', async () => {
    (api.post as any).mockRejectedValue(new Error('Invalid creds'));

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email or username/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText(/login failed|invalid creds/i)).toBeTruthy());
  });
});