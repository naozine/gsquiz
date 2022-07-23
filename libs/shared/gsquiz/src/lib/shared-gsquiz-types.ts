export interface QuizData {
  question: {
    text: string
    image?: string
  }
  choices: {
    text: string
    image?: string
    correct: boolean
  }[]
  answer: {
    text: string
    image?: string
  }
}
