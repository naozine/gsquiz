import { render } from '@testing-library/react'

import ChoiceView from './choice-view'

describe('ChoiceView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ChoiceView />)
    expect(baseElement).toBeTruthy()
  })
})
