import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectDetails from './ProjectDetails';

const {
  projectGetByIdMock,
  projectGetAnalysisMock,
  projectUpdateMock,
  recommendationsGetByProjectMock,
  recommendationsGenerateMock,
  recommendationsMarkCompleteMock,
} = vi.hoisted(() => ({
  projectGetByIdMock: vi.fn(),
  projectGetAnalysisMock: vi.fn(),
  projectUpdateMock: vi.fn(),
  recommendationsGetByProjectMock: vi.fn(),
  recommendationsGenerateMock: vi.fn(),
  recommendationsMarkCompleteMock: vi.fn(),
}));

vi.mock('../services/api', () => ({
  projectsAPI: {
    getById: projectGetByIdMock,
    getAnalysis: projectGetAnalysisMock,
    update: projectUpdateMock,
  },
  recommendationsAPI: {
    getByProject: recommendationsGetByProjectMock,
    generate: recommendationsGenerateMock,
    markComplete: recommendationsMarkCompleteMock,
  },
}));

const renderProjectDetails = () =>
  render(
    <MemoryRouter initialEntries={['/project/17']}>
      <Routes>
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/dashboard" element={<div>Dashboard Route</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ProjectDetails smoke states', () => {
  beforeEach(() => {
    projectGetByIdMock.mockReset();
    projectGetAnalysisMock.mockReset();
    projectUpdateMock.mockReset();
    recommendationsGetByProjectMock.mockReset();
    recommendationsGenerateMock.mockReset();
    recommendationsMarkCompleteMock.mockReset();

    projectGetByIdMock.mockResolvedValue({
      data: {
        id: 17,
        room_type: 'Living Room',
        budget: 2600,
        photo_url: '/uploads/project_17.png',
      },
    });
    projectGetAnalysisMock.mockResolvedValue({
      data: {
        selected_style: { id: 3, name: 'Scandinavian' },
        summary: 'Scandinavian scored 82% for this living room.',
        suggested_tags: [{ id: 1, name: 'neutral' }],
        style_scores: [
          { style_id: 3, style_name: 'Scandinavian', score_value: 82, matched_tags: ['neutral'] },
        ],
        shopping_plan: [],
        optimization: {
          algorithm: 'Bounded grouped exhaustive search',
          evaluated_combinations: 243,
          hard_constraints: [
            'Never exceed the strategy budget ceiling',
            'Select at most one product for each recommendation',
          ],
          assumptions: ['Prices are planning estimates'],
          scenarios: [
            {
              key: 'economical',
              title: 'Economical',
              description: 'Protect cash and fund the highest-priority changes first.',
              budget_ceiling: 1560,
              total_cost: 980,
              budget_remaining: 1620,
              budget_usage_percent: 37.7,
              coverage_count: 2,
              coverage_total: 4,
              impact_score: 74,
              items: [
                {
                  plan_item_key: 'sofa',
                  plan_item_label: 'Main seating anchor',
                  category: 'Furniture',
                  room_zone: 'Conversation area',
                  priority_rank: 1,
                  product_name: 'Value sofa',
                  retailer: 'IKEA',
                  estimated_cost: 760,
                  match_label: 'Best Value',
                },
              ],
              excluded_items: ['Accent finish'],
            },
            {
              key: 'balanced',
              title: 'Balanced',
              description: 'Balance room coverage, priority, style fit, and cost efficiency.',
              budget_ceiling: 2210,
              total_cost: 1840,
              budget_remaining: 760,
              budget_usage_percent: 70.8,
              coverage_count: 3,
              coverage_total: 4,
              impact_score: 86,
              items: [
                {
                  plan_item_key: 'sofa',
                  plan_item_label: 'Main seating anchor',
                  category: 'Furniture',
                  room_zone: 'Conversation area',
                  priority_rank: 1,
                  product_name: 'Balanced sofa',
                  retailer: 'Wayfair',
                  estimated_cost: 1040,
                  match_label: 'Best Fit',
                },
              ],
              excluded_items: [],
            },
          ],
        },
        recommendations: [
          {
            id: 91,
            description: 'Anchor the living room around neutral cues.',
            estimated_cost: 884,
            is_completed: false,
          },
        ],
      },
    });
    recommendationsGetByProjectMock.mockResolvedValue({ data: [] });
    projectUpdateMock.mockResolvedValue({ data: {} });
    recommendationsGenerateMock.mockResolvedValue({ data: {} });
    recommendationsMarkCompleteMock.mockResolvedValue({ data: {} });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows a recoverable project load error and supports retrying', async () => {
    const user = userEvent.setup();
    projectGetByIdMock
      .mockRejectedValueOnce({ message: 'Network Error' })
      .mockResolvedValue({
        data: {
          id: 17,
          room_type: 'Living Room',
          budget: 2600,
          photo_url: '/uploads/project_17.png',
        },
      });

    renderProjectDetails();

    expect(await screen.findByRole('heading', { name: /project unavailable/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/unable to reach api/i);

    await user.click(screen.getByRole('button', { name: /retry loading/i }));

    expect(await screen.findByRole('heading', { name: /living room/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /project unavailable/i })).not.toBeInTheDocument();
  });

  it('surfaces project action failures instead of failing silently', async () => {
    const user = userEvent.setup();
    recommendationsGenerateMock.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { detail: 'Plan refresh failed.' },
      },
    });

    renderProjectDetails();

    await screen.findByRole('heading', { name: /living room/i });
    await user.click(screen.getByRole('button', { name: /refresh plan/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/plan refresh failed/i);
    });
  });

  it('blocks invalid budget updates with a clear message', async () => {
    const user = userEvent.setup();

    renderProjectDetails();

    await screen.findByRole('heading', { name: /living room/i });

    const budgetInput = screen.getByRole('spinbutton', { name: /adjust budget ceiling/i });
    await user.clear(budgetInput);
    await user.type(budgetInput, '-5');
    await user.click(screen.getByRole('button', { name: /^update$/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/enter a positive budget amount/i);
    expect(projectUpdateMock).not.toHaveBeenCalled();
  });

  it('shows optimization evidence and lets the user compare valid strategies', async () => {
    const user = userEvent.setup();

    renderProjectDetails();

    expect(
      await screen.findByRole('heading', { name: /three valid plans. one hard budget/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('243')).toBeInTheDocument();
    expect(screen.getByRole('tabpanel', { name: /balanced optimized plan/i })).toHaveTextContent(
      'Balanced sofa',
    );

    await user.click(screen.getByRole('tab', { name: /economical/i }));

    expect(screen.getByRole('tabpanel', { name: /economical optimized plan/i })).toHaveTextContent(
      'Value sofa',
    );
    expect(screen.getByText(/deferred to respect this ceiling/i)).toBeInTheDocument();
  });
});
