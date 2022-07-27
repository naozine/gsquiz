import { render } from '@testing-library/react'

import FadeInOut from './fade-in-out'

describe('FadeInOut', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FadeInOut />)
    expect(baseElement).toBeTruthy()
  })
})
