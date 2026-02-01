import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import * as router from 'react-router-dom';
import api from '../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../lib/api', () => ({ post: vi.fn() }));

const mockNavigate = vi.fn();
vi.spyOn(router, 'useNavigate').mockReturnValue(mockNavigate as any);

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    (api.post as any).mockReset();
    mockNavigate.mockReset();
  });

  it('successful login sets token and navigates', async () => {
    (api.post as any).mockResolvedValue({ data: { token: 'test-token' } });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email or username/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(localStorage.getItem('carknow_token')).toBe('test-token'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
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