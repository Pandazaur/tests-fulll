import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import type { Props as CardUserProps } from './components/user/CardUser.tsx'
import GithubApi from './services/api/Github.api'

// Mock the API
vi.mock('./services/api/Github.api')

// Mock CSS modules
vi.mock('./App.module.css', () => ({
    default: {
        root: 'root',
        header: 'header',
        header__title: 'header__title',
        main: 'main',
        searchWrapper: 'searchWrapper',
        search: 'search',
        centerContent: 'centerContent',
        actions: 'actions',
        actions__buttons: 'actions__buttons',
        actions__button: 'actions__button',
        userGrid: 'userGrid',
    },
}))

// Mock CardUser component
vi.mock('./components/user/CardUser', () => ({
    default: ({ user, isSelectable, isSelected, onToggleSelect }: CardUserProps) => (
        <div data-testid={`card-user-${user.id}`}>
            {isSelectable && <input type="checkbox" checked={isSelected} onChange={(e) => onToggleSelect?.(user, e.target.checked)} data-testid={`checkbox-${user.id}`} />}
            <div>{user.login}</div>
        </div>
    ),
}))

// Mock Spinner component
vi.mock('./components/ui/Spinner', () => ({
    default: () => <div data-testid="spinner">Loading...</div>,
}))

// Mock Icons
vi.mock('./components/ui/icons/IconDuplicate', () => ({
    default: () => <div data-testid="icon-duplicate">Duplicate</div>,
}))

vi.mock('./components/ui/icons/IconTrash', () => ({
    default: () => <div data-testid="icon-trash">Trash</div>,
}))

const createMockUser = (id: number, login: string) => ({
    login,
    id,
    node_id: `MDQ6VXNlcjEyMzQ1Njc4OTA=`,
    avatar_url: `https://example.com/avatar${id}.jpg`,
    gravatar_id: '',
    url: `https://api.github.com/users/${login}`,
    html_url: `https://github.com/${login}`,
    followers_url: `https://api.github.com/users/${login}/followers`,
    following_url: `https://api.github.com/users/${login}/following{/other_user}`,
    gists_url: `https://api.github.com/users/${login}/gists{/gist_id}`,
    starred_url: `https://api.github.com/users/${login}/starred{/owner}{/repo}`,
    subscriptions_url: `https://api.github.com/users/${login}/subscriptions`,
    organizations_url: `https://api.github.com/users/${login}/orgs`,
    repos_url: `https://api.github.com/users/${login}/repos`,
    events_url: `https://api.github.com/users/${login}/events{/privacy}`,
    received_events_url: `https://api.github.com/users/${login}/received_events`,
    type: 'User' as const,
    user_view_type: 'public' as const,
    site_admin: false,
    score: 1,
})

const mockSearchResult = {
    total_count: 2,
    incomplete_results: false,
    items: [createMockUser(1, 'testuser1'), createMockUser(2, 'testuser2')],
}

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the app with search input', () => {
        render(<App />)

        expect(screen.getByRole('heading', { name: 'Github Search' })).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Search user')).toBeInTheDocument()
        expect(screen.getByLabelText(/Edit mode/)).toBeInTheDocument()
    })

    it('shows empty state message when search is empty', () => {
        render(<App />)

        expect(screen.getByText('Search a Github user by typing something in the search bar.')).toBeInTheDocument()
    })

    it('shows loading spinner while searching', async () => {
        const user = userEvent.setup()
        vi.mocked(GithubApi.searchProfiles).mockImplementation(() => new Promise(() => {}))

        render(<App />)

        const searchInput = screen.getByPlaceholderText('Search user')
        await user.type(searchInput, 'testuser')

        await waitFor(() => {
            expect(screen.getByTestId('spinner')).toBeInTheDocument()
        })
    })

    it('displays search results when API call succeeds', async () => {
        const user = userEvent.setup()
        vi.mocked(GithubApi.searchProfiles).mockResolvedValue(mockSearchResult)

        render(<App />)

        const searchInput = screen.getByPlaceholderText('Search user')
        await user.type(searchInput, 'testuser')

        await waitFor(() => {
            expect(screen.getByTestId('card-user-1')).toBeInTheDocument()
            expect(screen.getByTestId('card-user-2')).toBeInTheDocument()
        })
    })

    it('shows error message when API call fails with 403', async () => {
        const user = userEvent.setup()
        const mockResponse = new Response('', { status: 403 })
        vi.mocked(GithubApi.searchProfiles).mockRejectedValue(mockResponse)

        render(<App />)

        const searchInput = screen.getByPlaceholderText('Search user')
        await user.type(searchInput, 'testuser')

        await waitFor(() => {
            expect(screen.getByText(/Rate limit exceeded/)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
        })
    })

    it('shows generic error message when API call fails with other status', async () => {
        const user = userEvent.setup()
        const mockResponse = new Response('', { status: 500 })
        vi.mocked(GithubApi.searchProfiles).mockRejectedValue(mockResponse)

        render(<App />)

        const searchInput = screen.getByPlaceholderText('Search user')
        await user.type(searchInput, 'testuser')

        await waitFor(() => {
            expect(screen.getByText('An error occurred: Please try again in a few seconds.')).toBeInTheDocument()
        })
    })

    it('shows no results message when search returns empty results', async () => {
        const user = userEvent.setup()
        vi.mocked(GithubApi.searchProfiles).mockResolvedValue({
            total_count: 0,
            incomplete_results: false,
            items: [],
        })

        render(<App />)

        const searchInput = screen.getByPlaceholderText('Search user')
        await user.type(searchInput, 'nonexistentuser')

        await waitFor(() => {
            expect(screen.getByText(/No result for "nonexistentuser"/)).toBeInTheDocument()
        })
    })

    describe('Edit Mode', () => {
        it('hides edit actions when edit mode is disabled', async () => {
            const user = userEvent.setup()
            vi.mocked(GithubApi.searchProfiles).mockResolvedValue(mockSearchResult)

            render(<App />)

            const searchInput = screen.getByPlaceholderText('Search user')
            await user.type(searchInput, 'testuser')

            await waitFor(() => {
                expect(screen.getByTestId('card-user-1')).toBeInTheDocument()
            })

            expect(screen.queryByText(/elements selected/)).not.toBeInTheDocument()
        })

        it('shows edit actions when edit mode is enabled', async () => {
            const user = userEvent.setup()
            vi.mocked(GithubApi.searchProfiles).mockResolvedValue(mockSearchResult)

            render(<App />)

            const editModeCheckbox = screen.getByLabelText(/Edit mode/)
            await user.click(editModeCheckbox)

            const searchInput = screen.getByPlaceholderText('Search user')
            await user.type(searchInput, 'testuser')

            await waitFor(() => {
                expect(screen.getByText('0 elements selected')).toBeInTheDocument()
                expect(screen.getByTestId('icon-duplicate')).toBeInTheDocument()
                expect(screen.getByTestId('icon-trash')).toBeInTheDocument()
            })
        })

        it('allows selecting individual users in edit mode', async () => {
            const user = userEvent.setup()
            vi.mocked(GithubApi.searchProfiles).mockResolvedValue(mockSearchResult)

            render(<App />)

            const editModeCheckbox = screen.getByLabelText(/Edit mode/)
            await user.click(editModeCheckbox)

            const searchInput = screen.getByPlaceholderText('Search user')
            await user.type(searchInput, 'testuser')

            await waitFor(() => {
                expect(screen.getByTestId('checkbox-1')).toBeInTheDocument()
            })

            const userCheckbox = screen.getByTestId('checkbox-1')
            await user.click(userCheckbox)

            expect(screen.getByText('1 elements selected')).toBeInTheDocument()
        })

        it('allows selecting all users with master checkbox', async () => {
            const user = userEvent.setup()
            vi.mocked(GithubApi.searchProfiles).mockResolvedValue(mockSearchResult)

            render(<App />)

            const editModeCheckbox = screen.getByLabelText(/Edit mode/)
            await user.click(editModeCheckbox)

            const searchInput = screen.getByPlaceholderText('Search user')
            await user.type(searchInput, 'testuser')

            await waitFor(() => {
                expect(screen.getByText('0 elements selected')).toBeInTheDocument()
            })

            // Find the master checkbox by its position in the actions section
            const checkboxes = screen.getAllByRole('checkbox')
            const masterCheckbox = checkboxes.find((checkbox) => checkbox !== editModeCheckbox && !checkbox.getAttribute('data-testid')?.includes('checkbox-'))

            expect(masterCheckbox).toBeInTheDocument()
            await user.click(masterCheckbox!)

            // The master checkbox should be checked after clicking
            expect(masterCheckbox).toBeChecked()

            // The individual card checkboxes should also be checked
            const cardCheckboxes = screen.getAllByRole('checkbox').filter((cb) => cb.getAttribute('data-testid')?.includes('checkbox-'))
            cardCheckboxes.forEach((checkbox) => {
                expect(checkbox).toBeChecked()
            })
        })
    })

    it('retries API call when retry button is clicked', async () => {
        const user = userEvent.setup()
        const mockResponse = new Response('', { status: 403 })
        vi.mocked(GithubApi.searchProfiles).mockRejectedValueOnce(mockResponse).mockResolvedValueOnce(mockSearchResult)

        render(<App />)

        const searchInput = screen.getByPlaceholderText('Search user')
        await user.type(searchInput, 'testuser')

        await waitFor(() => {
            expect(screen.getByText(/Rate limit exceeded/)).toBeInTheDocument()
        })

        const retryButton = screen.getByRole('button', { name: 'Retry' })
        await user.click(retryButton)

        await waitFor(() => {
            expect(screen.getByTestId('card-user-1')).toBeInTheDocument()
        })
    })
})
