import { vi } from 'vitest'
import GithubApi from './Github.api'

const mockResponse = {
  total_count: 2,
  items: [
    {
      id: 1,
      login: 'testuser1',
      avatar_url: 'https://example.com/avatar1.jpg',
      html_url: 'https://github.com/testuser1'
    },
    {
      id: 2,
      login: 'testuser2',
      avatar_url: 'https://example.com/avatar2.jpg',
      html_url: 'https://github.com/testuser2'
    }
  ]
}

// Mock fetch globally
global.fetch = vi.fn()

describe('GithubApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchProfiles', () => {
    it('returns parsed JSON when response is ok', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse)
      } as any)

      const result = await GithubApi.searchProfiles('testuser')

      expect(fetch).toHaveBeenCalledWith('https://api.github.com/search/users?q=testuser')
      expect(result).toEqual(mockResponse)
    })

    it('throws response object when response is not ok', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      }

      vi.mocked(fetch).mockResolvedValue(mockErrorResponse as any)

      await expect(GithubApi.searchProfiles('testuser')).rejects.toBe(mockErrorResponse)
    })

    it('properly encodes search query in URL', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse)
      } as any)

      await GithubApi.searchProfiles('test user with spaces')

      expect(fetch).toHaveBeenCalledWith('https://api.github.com/search/users?q=test+user+with+spaces')
    })

    it('handles special characters in search query', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse)
      } as any)

      await GithubApi.searchProfiles('user@example.com')

      expect(fetch).toHaveBeenCalledWith('https://api.github.com/search/users?q=user%40example.com')
    })

    it('handles empty search query', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ total_count: 0, items: [] })
      } as any)

      const result = await GithubApi.searchProfiles('')

      expect(fetch).toHaveBeenCalledWith('https://api.github.com/search/users?q=')
      expect(result).toEqual({ total_count: 0, items: [] })
    })

    it('throws when fetch fails', async () => {
      const fetchError = new Error('Network error')
      vi.mocked(fetch).mockRejectedValue(fetchError)

      await expect(GithubApi.searchProfiles('testuser')).rejects.toThrow('Network error')
    })

    it('throws response for different HTTP error codes', async () => {
      const scenarios = [
        { status: 404, statusText: 'Not Found' },
        { status: 500, statusText: 'Internal Server Error' },
        { status: 422, statusText: 'Unprocessable Entity' }
      ]

      for (const scenario of scenarios) {
        vi.clearAllMocks()
        const mockErrorResponse = {
          ok: false,
          ...scenario
        }

        vi.mocked(fetch).mockResolvedValue(mockErrorResponse as any)

        await expect(GithubApi.searchProfiles('testuser')).rejects.toBe(mockErrorResponse)
      }
    })
  })
})