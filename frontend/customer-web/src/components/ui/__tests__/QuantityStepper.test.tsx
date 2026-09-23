import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import QuantityStepper from '../QuantityStepper'

describe('QuantityStepper', () => {
  it('renders correctly with given value', () => {
    render(<QuantityStepper value={5} onChange={() => {}} max={10} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('calls onChange with incremented value when plus is clicked', () => {
    const handleChange = vi.fn()
    render(<QuantityStepper value={5} onChange={handleChange} max={10} />)
    
    const incrementBtn = screen.getByLabelText('Increase quantity')
    fireEvent.click(incrementBtn)
    
    expect(handleChange).toHaveBeenCalledWith(6)
  })

  it('calls onChange with decremented value when minus is clicked', () => {
    const handleChange = vi.fn()
    render(<QuantityStepper value={5} onChange={handleChange} max={10} />)
    
    const decrementBtn = screen.getByLabelText('Decrease quantity')
    fireEvent.click(decrementBtn)
    
    expect(handleChange).toHaveBeenCalledWith(4)
  })

  it('disables increment button when value reaches max', () => {
    render(<QuantityStepper value={10} onChange={() => {}} max={10} />)
    
    const incrementBtn = screen.getByLabelText('Increase quantity')
    expect(incrementBtn).toBeDisabled()
  })

  it('disables decrement button when value reaches min (default 1)', () => {
    render(<QuantityStepper value={1} onChange={() => {}} max={10} />)
    
    const decrementBtn = screen.getByLabelText('Decrease quantity')
    expect(decrementBtn).toBeDisabled()
  })
})
