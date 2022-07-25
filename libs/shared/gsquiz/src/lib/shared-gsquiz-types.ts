export type QuizDataFieldType =
  | 'question'
  | 'answer'
  | 'choice1'
  | 'choice2'
  | 'choice3'
  | 'choice4'
  | 'choice5'
export interface QuizData {
  id: string
  question: {
    text: string
    image?: string
    rubyHtml?: string[][]
  }
  choices: {
    text: string
    image?: string
    correct: boolean
    rubyHtml?: string[][]
  }[]
  answer: {
    text: string
    image?: string
    rubyHtml?: string[][]
  }
}
