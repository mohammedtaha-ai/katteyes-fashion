import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { HeroPromoSlider } from '@/components/storefront/HeroPromoSlider'

describe('HeroPromoSlider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders initial slide with title, badge, subtitle, and CTA', () => {
    render(<HeroPromoSlider />)
    expect(screen.getByText(/أزياء عصرية بأناقة لا تُضاهى/)).toBeInTheDocument()
    expect(screen.getByText(/تشكيلة الموسم/)).toBeInTheDocument()
    expect(screen.getByTestId('hero-cta-btn')).toBeInTheDocument()
  })

  it('cycles to next and previous slides via chevrons', () => {
    render(<HeroPromoSlider />)

    const nextBtn = screen.getByTestId('hero-next-btn')
    const prevBtn = screen.getByTestId('hero-prev-btn')

    // Click next -> slide 2
    fireEvent.click(nextBtn)
    expect(screen.getByText(/تألقي بخصومات صيف 2026/)).toBeInTheDocument()

    // Click next -> slide 3
    fireEvent.click(nextBtn)
    expect(screen.getByText(/تصاميم ملكية لكل مناسبة/)).toBeInTheDocument()

    // Click prev -> back to slide 2
    fireEvent.click(prevBtn)
    expect(screen.getByText(/تألقي بخصومات صيف 2026/)).toBeInTheDocument()
  })

  it('jumps to specific slide when clicking indicator dots', () => {
    render(<HeroPromoSlider />)

    const dot2 = screen.getByTestId('hero-dot-2')
    fireEvent.click(dot2)
    expect(screen.getByText(/تصاميم ملكية لكل مناسبة/)).toBeInTheDocument()

    const dot0 = screen.getByTestId('hero-dot-0')
    fireEvent.click(dot0)
    expect(screen.getByText(/أزياء عصرية بأناقة لا تُضاهى/)).toBeInTheDocument()
  })

  it('auto-rotates slides every interval and pauses on hover', () => {
    render(<HeroPromoSlider intervalMs={3000} />)

    expect(screen.getByText(/أزياء عصرية بأناقة لا تُضاهى/)).toBeInTheDocument()

    // Advance 3s -> next slide
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText(/تألقي بخصومات صيف 2026/)).toBeInTheDocument()

    // Hover container -> pauses
    const container = screen.getByTestId('hero-promo-slider')
    fireEvent.mouseEnter(container)

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    // Still on slide 2 because it paused
    expect(screen.getByText(/تألقي بخصومات صيف 2026/)).toBeInTheDocument()

    // Mouse leave -> resumes
    fireEvent.mouseLeave(container)
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText(/تصاميم ملكية لكل مناسبة/)).toBeInTheDocument()
  })
})
