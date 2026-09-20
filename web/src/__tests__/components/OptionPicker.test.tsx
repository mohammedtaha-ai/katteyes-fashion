import { render, screen, fireEvent } from '@testing-library/react'
import { OptionPicker } from '@/components/product/OptionPicker'

it('marks the selected option', () => {
  render(
    <OptionPicker
      label="اللون"
      options={['أحمر', 'أزرق']}
      value="أحمر"
      onChange={() => {}}
    />,
  )
  const redBtn = screen.getByTestId('opt-أحمر')
  expect(redBtn.className).toMatch(/bg-black/)
  const blueBtn = screen.getByTestId('opt-أزرق')
  expect(blueBtn.className).not.toMatch(/bg-black/)
})

it('emits onChange with the picked option', () => {
  const onChange = vi.fn()
  render(
    <OptionPicker
      label="اللون"
      options={['أحمر', 'أزرق']}
      value="أحمر"
      onChange={onChange}
    />,
  )
  fireEvent.click(screen.getByTestId('opt-أزرق'))
  expect(onChange).toHaveBeenCalledWith('أزرق')
})
