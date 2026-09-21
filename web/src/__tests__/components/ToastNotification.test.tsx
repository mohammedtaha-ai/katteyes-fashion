import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastNotification } from '@/components/storefront/ToastNotification'
import { useToastStore } from '@/stores/toast-store'

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

describe('ToastNotification', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
    mockedNavigate.mockClear()
  })

  function wrap() {
    return render(
      <MemoryRouter>
        <ToastNotification />
      </MemoryRouter>,
    )
  }

  it('renders nothing when there are no toasts', () => {
    const { container } = wrap()
    expect(container.firstChild).toBeNull()
  })

  it('renders toast with thumbnail, product name, message, and action button', () => {
    useToastStore.setState({
      toasts: [
        {
          id: 'test-1',
          productName: 'فستان صيفي أنيق',
          message: 'تمت الإضافة إلى السلة بنجاح',
          thumbnail: 'https://example.com/dress.jpg',
        },
      ],
    })

    wrap()

    expect(screen.getByText('فستان صيفي أنيق')).toBeInTheDocument()
    expect(screen.getByText('تمت الإضافة إلى السلة بنجاح')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'فستان صيفي أنيق' })).toHaveAttribute(
      'src',
      'https://example.com/dress.jpg',
    )
    expect(screen.getByRole('button', { name: /عرض السلة/ })).toBeInTheDocument()
  })

  it('navigates to /cart and removes toast when "عرض السلة" is clicked', () => {
    useToastStore.setState({
      toasts: [
        {
          id: 'test-1',
          productName: 'حقيبة يد',
          message: 'تمت الإضافة',
        },
      ],
    })

    wrap()

    const cartBtn = screen.getByRole('button', { name: /عرض السلة/ })
    fireEvent.click(cartBtn)

    expect(mockedNavigate).toHaveBeenCalledWith('/cart')
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('removes toast when dismiss button is clicked', () => {
    useToastStore.setState({
      toasts: [
        {
          id: 'test-1',
          message: 'إشعار تجريبي',
        },
      ],
    })

    wrap()

    const dismissBtn = screen.getByLabelText('إغلاق')
    fireEvent.click(dismissBtn)

    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
