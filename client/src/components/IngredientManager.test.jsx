import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import IngredientManager from './IngredientManager'

// Mock fetch globally
globalThis.fetch = vi.fn()

describe('IngredientManager', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Default mock response
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, name: 'Tomato', category: 'Vegetable', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2 },
        { id: 2, name: 'Chicken', category: 'Meat', calories: 165, protein: 31, carbs: 0, fats: 3.6 }
      ])
    })
  })

  it('renders without crashing', () => {
    render(<IngredientManager />)
    expect(screen.getByText('Ingredient Library')).toBeInTheDocument()
  })

  it('displays search input and button', () => {
    render(<IngredientManager />)
    expect(screen.getByPlaceholderText('Search natural ingredients...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('shows create custom button', () => {
    render(<IngredientManager />)
    expect(screen.getByRole('button', { name: /create custom/i })).toBeInTheDocument()
  })

  it('loads ingredients on mount', async () => {
    render(<IngredientManager />)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/ingredients')
    })
  })

  it('displays ingredient cards after loading', async () => {
    render(<IngredientManager />)

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument()
      expect(screen.getByText('Chicken')).toBeInTheDocument()
    })
  })

  it('opens create custom modal when button is clicked', () => {
    render(<IngredientManager />)

    const createButton = screen.getByRole('button', { name: /create custom/i })
    fireEvent.click(createButton)

    expect(screen.getByText('New Ingredient')).toBeInTheDocument()
  })

  it('shows save action inside custom ingredient modal', () => {
    render(<IngredientManager />)

    fireEvent.click(screen.getByRole('button', { name: /create custom/i }))

    expect(screen.getByRole('button', { name: /save ingredient/i })).toBeInTheDocument()
  })

  it('performs search when search button is clicked', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: 3, name: 'Basil', category: 'Spice', calories: 23 }])
    })

    render(<IngredientManager />)

    const searchInput = screen.getByPlaceholderText('Search natural ingredients...')
    const searchButton = screen.getByRole('button', { name: /search/i })

    fireEvent.change(searchInput, { target: { value: 'basil' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/ingredients/search?q=basil')
    })
  })

  it('handles search on Enter key press', async () => {
    render(<IngredientManager />)

    const searchInput = screen.getByPlaceholderText('Search natural ingredients...')
    fireEvent.change(searchInput, { target: { value: 'garlic' } })
    fireEvent.keyDown(searchInput, { key: 'Enter' })

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/ingredients/search?q=garlic')
    })
  })
})
