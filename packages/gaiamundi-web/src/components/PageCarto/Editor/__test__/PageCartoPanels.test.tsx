import { fireEvent, render, waitFor } from '@testing-library/react';
import { PageCartoProvider } from 'hooks/usePageCarto';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mockPageCartoData } from 'utils/mocks/data';
import { PageCartoPanels } from '../PageCartoPanels';

// Mock the usePageCarto hook to return a fake response object
jest.mock('services/page-carto', () => {
  return {
    getPageCartoById() {
      return Promise.resolve({
        data: mockPageCartoData,
      });
    },
  };
});

describe('PageCartoPanels', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders the tabs and their content', async () => {
    const queryClient = new QueryClient();
    const { getAllByRole, getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <PageCartoProvider id={mockPageCartoData.id}>
          <PageCartoPanels />
        </PageCartoProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const tabs = getAllByRole('tab');
      expect(tabs).toHaveLength(3);

      fireEvent.click(tabs[1]);
      expect(getByTestId('import-dataset')).toBeDefined();
    });
  });
});
