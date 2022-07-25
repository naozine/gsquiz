import { render } from '@testing-library/react'

import QuizAnswerView from './quiz-answer-view'

describe('QuizAnswerView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<QuizAnswerView />)
    expect(baseElement).toBeTruthy()
  })
})
