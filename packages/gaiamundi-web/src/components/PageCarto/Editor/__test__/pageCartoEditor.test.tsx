import { render } from '@testing-library/react';
import { usePageCarto } from 'hooks/usePageCarto';
import { QueryClient, QueryClientProvider } from 'react-query';
import { PageCartoEditor } from '../PageCartoEditor';

jest.mock('hooks/usePageCarto');
jest.mock('@excalidraw/excalidraw', () => ({
  // mock implementation of excalidraw
}));
jest.mock('lib0/webcrypto', () => ({
  // mock implementation of webcrypto
}));

jest.mock('nanoid', () => ({
  nanoid: () => 'mocked-id',
}));
describe('pageCartoEditor', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders the correct children components', async () => {
    (usePageCarto as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      error: undefined,
      data: undefined,
    });
    const queryClient = new QueryClient();
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <PageCartoEditor />
      </QueryClientProvider>
    );
    const pageMap = getByTestId('loading-message');
    expect(pageMap).toBeInTheDocument();
    const pagePanels = getByTestId('pagecarto-panels');
    expect(pagePanels).toBeInTheDocument();
  });
});
