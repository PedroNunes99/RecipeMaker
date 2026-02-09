import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test-utils'
import RecipeDetail from './RecipeDetail'

describe('RecipeDetail', () => {
  const mockRecipe = {
    title: 'Test Recipe',
    calories: 450,
    protein: 32,
    carbs: 45,
    fat: 12,
    steps: [
      { order: 1, instruction: 'Step 1: Prepare ingredients' },
      { order: 2, instruction: 'Step 2: Cook everything' }
    ],
    ingredients: [
      { name: 'Chicken', quantity: 200, unit: 'g' },
      { name: 'Rice', quantity: 150, unit: 'g' }
    ]
  }

  const mockOnBack = vi.fn()

  it('renders recipe title', () => {
    render(<RecipeDetail recipe={mockRecipe} onBack={mockOnBack} />)
    expect(screen.getByText('Test Recipe')).toBeInTheDocument()
  })

  it('displays nutritional information', () => {
    render(<RecipeDetail recipe={mockRecipe} onBack={mockOnBack} />)

    expect(screen.getByText('450')).toBeInTheDocument() // calories
    expect(screen.getByText('32')).toBeInTheDocument() // protein
    expect(screen.getByText('45')).toBeInTheDocument() // carbs
    expect(screen.getByText('12')).toBeInTheDocument() // fat
  })

  it('displays all ingredients', () => {
    render(<RecipeDetail recipe={mockRecipe} onBack={mockOnBack} />)

    expect(screen.getByText('Chicken')).toBeInTheDocument()
    expect(screen.getByText('Rice')).toBeInTheDocument()
    expect(screen.getByText('200 g')).toBeInTheDocument()
    expect(screen.getByText('150 g')).toBeInTheDocument()
  })

  it('displays cooking steps in order', () => {
    render(<RecipeDetail recipe={mockRecipe} onBack={mockOnBack} />)

    expect(screen.getByText('Step 1: Prepare ingredients')).toBeInTheDocument()
    expect(screen.getByText('Step 2: Cook everything')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    render(<RecipeDetail recipe={mockRecipe} onBack={mockOnBack} />)

    const backButton = screen.getByRole('button')
    fireEvent.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('returns null when recipe is not provided', () => {
    const { container } = render(<RecipeDetail recipe={null} onBack={mockOnBack} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays instructions section header', () => {
    render(<RecipeDetail recipe={mockRecipe} onBack={mockOnBack} />)
    expect(screen.getByText('Instructions')).toBeInTheDocument()
  })

  it('displays ingredients section header', () => {
    render(<RecipeDetail recipe={mockRecipe} onBack={mockOnBack} />)
    expect(screen.getByText('Ingredients')).toBeInTheDocument()
  })

  it('displays nutritional profile header', () => {
    render(<RecipeDetail recipe={mockRecipe} onBack={mockOnBack} />)
    expect(screen.getByText('Nutritional Profile')).toBeInTheDocument()
  })
})
