import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from './App';

const useAuthMock = vi.fn();

vi.mock('./context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('./components/ApiStatusBanner', () => ({
  default: () => null,
}));

const PathProbe = () => {
  const { pathname } = useLocation();
  return <output data-testid="path-probe">{pathname}</output>;
};

const renderAppAt = (path = '/login') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <PathProbe />
    </MemoryRouter>
  );

beforeEach(() => {
  useAuthMock.mockReset();
  useAuthMock.mockReturnValue({
    user: null,
    token: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
});

describe('App smoke routing', () => {
  it('renders login on /login', () => {
    renderAppAt('/login');
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByTestId('path-probe')).toHaveTextContent('/login');
  });

  it('renders registration mode on /register', () => {
    renderAppAt('/register');
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByTestId('path-probe')).toHaveTextContent('/register');
  });

  it('switches route from /login to /register when toggling auth mode', async () => {
    const user = userEvent.setup();
    renderAppAt('/login');

    await user.click(screen.getByRole('button', { name: /create an account/i }));

    expect(await screen.findByRole('heading', { name: /create account/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByTestId('path-probe')).toHaveTextContent('/register');
  });

  it('redirects unauthenticated access from /dashboard to /login', async () => {
    renderAppAt('/dashboard');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByTestId('path-probe')).toHaveTextContent('/login');
  });

  it('shows protected navigation for authenticated sessions and allows logout navigation', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();

    useAuthMock.mockReturnValue({
      user: { full_name: 'Test User' },
      token: 'fake-token',
      loading: false,
      login: vi.fn(),
      logout,
    });

    renderAppAt('/workspace');

    expect(screen.getAllByRole('link', { name: /workspace/i }).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /test/i }));
    await user.click(await screen.findByRole('button', { name: /^logout$/i }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('heading', { name: /welcome back/i }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByTestId('path-probe')).toHaveTextContent('/login');
  });
});
