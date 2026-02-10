import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import GlobalSearch from '../../components/shared/GlobalSearch';

function renderGlobalSearch() {
  return render(
    <MemoryRouter>
      <GlobalSearch />
    </MemoryRouter>
  );
}

describe('GlobalSearch', () => {
  it('renders search input with placeholder', () => {
    renderGlobalSearch();
    expect(screen.getByPlaceholderText('Search everything... (Ctrl+K)')).toBeInTheDocument();
  });

  it('shows results after typing a query', async () => {
    const user = userEvent.setup();
    renderGlobalSearch();

    const input = screen.getByPlaceholderText('Search everything... (Ctrl+K)');
    await user.type(input, 'Springfield');

    await waitFor(() => {
      expect(screen.getByText(/Result for Springfield/)).toBeInTheDocument();
    });
  });

  it('does not search for queries shorter than 2 characters', async () => {
    const user = userEvent.setup();
    renderGlobalSearch();

    const input = screen.getByPlaceholderText('Search everything... (Ctrl+K)');
    await user.type(input, 'a');

    // No results dropdown should appear
    expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
  });

  it('clears input when X button is clicked', async () => {
    const user = userEvent.setup();
    renderGlobalSearch();

    const input = screen.getByPlaceholderText('Search everything... (Ctrl+K)');
    await user.type(input, 'test query');

    // Find the clear button (X icon)
    const clearButtons = screen.getAllByRole('button');
    const clearBtn = clearButtons[0];
    await user.click(clearBtn);

    expect(input).toHaveValue('');
  });

  it('shows no results message for unmatched query', async () => {
    const { http, HttpResponse } = await import('msw');
    const { server } = await import('../../test/mocks/server');

    server.use(
      http.get('/api/search', () => {
        return HttpResponse.json({ success: true, data: { results: [], grouped: {}, total: 0, query: 'zzzznonexistent' } });
      })
    );

    const user = userEvent.setup();
    renderGlobalSearch();

    const input = screen.getByPlaceholderText('Search everything... (Ctrl+K)');
    await user.type(input, 'zzzznonexistent');

    await waitFor(() => {
      expect(screen.getByText(/No results found/)).toBeInTheDocument();
    });
  });
});
