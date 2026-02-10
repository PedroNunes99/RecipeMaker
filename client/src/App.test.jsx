import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from './test-utils'
import App from './App'

// Mock fetch globally
global.fetch = vi.fn()

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock recipes endpoint
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: 1,
          title: 'Test Recipe 1',
          description: 'A delicious test recipe',
          calories: 450,
          protein: 32
        }
      ])
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<App />)
    // Check that the app container renders
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
    // Check for key navigation elements
    expect(screen.getByRole('button', { name: /recipes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingredients/i })).toBeInTheDocument()
  })

  it('displays navigation tabs', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /recipes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingredients/i })).toBeInTheDocument()
  })

  it('recipes tab is active by default', () => {
    render(<App />)

    const recipesButton = screen.getByRole('button', { name: /recipes/i })
    expect(recipesButton).toHaveClass('bg-sage-600')
  })

  it('switches to create tab when clicked', () => {
    render(<App />)

    const createButton = screen.getByRole('button', { name: /create/i })
    fireEvent.click(createButton)

    expect(createButton).toHaveClass('bg-sage-600')
    expect(screen.getByText('Create New Recipe')).toBeInTheDocument()
  })

  it('switches to ingredients tab when clicked', () => {
    render(<App />)

    const ingredientsButton = screen.getByRole('button', { name: /ingredients/i })
    fireEvent.click(ingredientsButton)

    expect(ingredientsButton).toHaveClass('bg-sage-600')
    expect(screen.getByText('Ingredient Library')).toBeInTheDocument()
  })

  it('loads recipes on mount when on recipes tab', async () => {
    render(<App />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/recipes')
    })
  })

  it('displays recipe list after loading', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument()
      expect(screen.getByText('A delicious test recipe')).toBeInTheDocument()
    })
  })

  it('shows empty state when no recipes exist', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/no recipes found/i)).toBeInTheDocument()
    })
  })

  it('displays recipe detail when recipe card is clicked', async () => {
    // Mock with full recipe structure including all required fields
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          id: 1,
          title: 'Test Recipe 1',
          description: 'A delicious test recipe',
          calories: 450,
          protein: 32,
          carbs: 40,
          fat: 15,
          steps: [{ order: 1, instruction: 'Test step' }],
          ingredients: [{ name: 'Test ingredient', quantity: 100, unit: 'g' }]
        }
      ])
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument()
    })

    const recipeCard = screen.getByText('Test Recipe 1').closest('div')
    fireEvent.click(recipeCard)

    // Recipe detail should now be visible, Your Collection should not be
    await waitFor(() => {
      expect(screen.queryByText('Your Collection')).not.toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch.mockRejectedValueOnce(new Error('API Error'))

    render(<App />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })
})
