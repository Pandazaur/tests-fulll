import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import CardUser, { type User } from './CardUser'

// Mock CSS modules
vi.mock('./CardUser.module.css', () => ({
    default: {
        card: 'card',
        card__body: 'card__body',
        card__checkbox: 'card__checkbox',
        card__avatar: 'card__avatar',
        card__text: 'card__text',
        card__userId: 'card__userId',
        card__button: 'card__button',
    },
}))

const mockUser: User = {
    id: 123,
    login: 'testuser',
    avatar_url: 'https://example.com/avatar.jpg',
    html_url: 'https://github.com/testuser',
}

describe('CardUser', () => {
    it('renders user information correctly', () => {
        render(<CardUser user={mockUser} />)

        expect(screen.getByText('testuser')).toBeInTheDocument()
        expect(screen.getByText('123')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Avatar' })).toHaveAttribute('src', 'https://example.com/avatar.jpg')
        expect(screen.getByRole('link')).toHaveAttribute('href', 'https://github.com/testuser')
        expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
        expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')
        expect(screen.getByRole('button', { name: 'View profile' })).toBeInTheDocument()
    })

    it('does not show checkbox when not selectable', () => {
        render(<CardUser user={mockUser} isSelectable={false} />)

        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('shows checkbox when selectable', () => {
        render(<CardUser user={mockUser} isSelectable={true} />)

        expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('shows unchecked checkbox when not selected', () => {
        render(<CardUser user={mockUser} isSelectable={true} isSelected={false} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
    })

    it('shows checked checkbox when selected', () => {
        render(<CardUser user={mockUser} isSelectable={true} isSelected={true} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
    })

    it('calls onToggleSelect when checkbox is clicked', async () => {
        const user = userEvent.setup()
        const mockOnToggleSelect = vi.fn()

        render(<CardUser user={mockUser} isSelectable={true} isSelected={false} onToggleSelect={mockOnToggleSelect} />)

        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)

        expect(mockOnToggleSelect).toHaveBeenCalledWith(mockUser, true)
    })

    it('calls onToggleSelect with false when unchecking', async () => {
        const user = userEvent.setup()
        const mockOnToggleSelect = vi.fn()

        render(<CardUser user={mockUser} isSelectable={true} isSelected={true} onToggleSelect={mockOnToggleSelect} />)

        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)

        expect(mockOnToggleSelect).toHaveBeenCalledWith(mockUser, false)
    })

    it('does not call onToggleSelect when checkbox is clicked but no handler provided', async () => {
        const user = userEvent.setup()
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        render(<CardUser user={mockUser} isSelectable={true} isSelected={false} />)

        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)

        // Should not throw an error
        expect(consoleSpy).not.toHaveBeenCalled()
        consoleSpy.mockRestore()
    })

    it('renders with different user data', () => {
        const differentUser: User = {
            id: 456,
            login: 'anotheruser',
            avatar_url: 'https://example.com/another.jpg',
            html_url: 'https://github.com/anotheruser',
        }

        render(<CardUser user={differentUser} />)

        expect(screen.getByText('anotheruser')).toBeInTheDocument()
        expect(screen.getByText('456')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Avatar' })).toHaveAttribute('src', 'https://example.com/another.jpg')
        expect(screen.getByRole('link')).toHaveAttribute('href', 'https://github.com/anotheruser')
    })
})
