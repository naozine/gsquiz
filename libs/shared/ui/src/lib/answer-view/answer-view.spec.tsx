import { render } from '@testing-library/react'

import AnswerView from './answer-view'

describe('AnswerView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AnswerView />)
    expect(baseElement).toBeTruthy()
  })
})
