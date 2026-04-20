import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

const useAuthMock = vi.fn();
const { projectsGetAllMock, stylesGetAllMock } = vi.hoisted(() => ({
  projectsGetAllMock: vi.fn(),
  stylesGetAllMock: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../services/api', () => ({
  projectsAPI: {
    getAll: projectsGetAllMock,
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  stylesAPI: {
    getAll: stylesGetAllMock,
    getById: vi.fn(),
    getTags: vi.fn(),
    getAllTags: vi.fn(),
  },
  searchAPI: {
    searchStyles: vi.fn(),
  },
}));

describe('Dashboard accessibility', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    projectsGetAllMock.mockReset();
    stylesGetAllMock.mockReset();

    useAuthMock.mockReturnValue({
      user: { full_name: 'Test User' },
      token: 'fake-token',
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    projectsGetAllMock.mockResolvedValue({ data: [] });
    stylesGetAllMock.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Scandinavian',
          description: 'Cozy minimalism with natural materials and calm light.',
          reasons: ['Natural wood improves warmth and comfort'],
          detected: ['Soft daylight detected'],
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('opens a labeled modal drawer and exposes DNA chip pressed state', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>,
    );

    await user.click(
      await screen.findByRole('button', { name: /explore scandinavian style/i }, { timeout: 3000 }),
    );

    const dialog = await screen.findByRole('dialog', { name: /scandinavian studio/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription(/select a style dna chip to highlight matching cues/i);

    const naturalWoodChip = within(dialog).getByRole('button', { name: /natural wood/i });
    expect(naturalWoodChip).toHaveAttribute('aria-pressed', 'false');

    await user.click(naturalWoodChip);

    expect(naturalWoodChip).toHaveAttribute('aria-pressed', 'true');
  });
});
