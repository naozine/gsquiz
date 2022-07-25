import { render } from '@testing-library/react'

import QuizView from './quiz-view'

describe('QuizView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<QuizView />)
    expect(baseElement).toBeTruthy()
  })
})
