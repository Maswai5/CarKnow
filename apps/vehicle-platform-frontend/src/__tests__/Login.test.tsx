import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import api from '../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../lib/api', () => ({ default: { post: vi.fn() } }));

const mockMutate = vi.fn();
vi.mock('../hooks/useAuth', () => ({ useLogin: () => ({ mutateAsync: mockMutate, isLoading: false }) }));

import { cleanup } from '@testing-library/react';

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  qc.mount();
  return render(<QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>);
}

afterEach(() => {
  cleanup();
});

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    (api.post as any).mockReset();
    mockMutate.mockReset();
  });

  it('successful login sets token', async () => {
    mockMutate.mockImplementation(async () => {
      // simulate the hook storing the token like the real hook does
      localStorage.setItem('carknow_token', 'test-token');
      return { token: 'test-token' };
    });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email or username/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(localStorage.getItem('carknow_token')).toBe('test-token'));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('shows error when login fails', async () => {
    mockMutate.mockImplementation(async () => {
      throw new Error('Invalid creds');
    });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email or username/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText(/login failed|invalid creds/i)).toBeTruthy());
    expect(mockMutate).toHaveBeenCalled();
  });
});