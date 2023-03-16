import { render, waitFor } from '@testing-library/react';
import { PageCartoProvider } from 'hooks/usePageCarto';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mockMapPath, mockPageCartoData } from 'utils/mocks/data';
import { PageCartoMap } from '../PageCartoMap';

// ResizeObserver is not defined used by eazychart
class ResizeObserver {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
}

// Mock useAuth hook to return a fake user object
jest.mock('hooks/useAuth', () => {
  return {
    useAuth() {
      return {
        isAuthenticated: true,
        user: { id: 1 },
      };
    },
  };
});

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

jest.mock('services/geo-map', () => {
  return {
    getGeoJson() {
      return Promise.resolve(mockMapPath);
    },
  };
});

// Unable to find the geo domain key in the feature properties
describe('PageCartoMap', () => {
  window.ResizeObserver = ResizeObserver;

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders loading message while data is being fetched', async () => {
    const queryClient = new QueryClient();
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <PageCartoProvider id={mockPageCartoData.id}>
          <PageCartoMap />
        </PageCartoProvider>
      </QueryClientProvider>
    );
    await waitFor(() => {
      expect(getByTestId('loading-message')).toBeInTheDocument();
    });
  });

  it('renders map once geojson data is fetched', async () => {
    const queryClient = new QueryClient();
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <PageCartoProvider id={mockPageCartoData.id}>
          <PageCartoMap />
        </PageCartoProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const map = getByTestId('map-chart');
      expect(map).toBeInTheDocument();
      expect(map).toMatchSnapshot();
    });
  });
});
