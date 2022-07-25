import { render } from '@testing-library/react'

import RubyText from './ruby-text'

describe('RubyText', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RubyText />)
    expect(baseElement).toBeTruthy()
  })
})
