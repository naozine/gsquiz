import { render } from '@testing-library/react'

import QuizDataImageUploader from './quiz-data-image-uploader'

describe('QuizDataImageUploader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<QuizDataImageUploader />)
    expect(baseElement).toBeTruthy()
  })
})
