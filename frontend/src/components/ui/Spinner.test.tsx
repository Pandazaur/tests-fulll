import { render } from '@testing-library/react'
import { vi } from 'vitest'
import Spinner from './Spinner'

// Mock CSS modules
vi.mock('./Spinner.module.css', () => ({
  default: {
    spinner: 'spinner'
  }
}))

describe('Spinner', () => {
  it('renders spinner element with correct class', () => {
    const { container } = render(<Spinner />)

    const spinner = container.querySelector('.spinner')
    expect(spinner).toBeInTheDocument()
  })
})