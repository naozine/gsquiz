// import { PageState, PageStateType, QuizData } from '@gsquiz/shared/gsquiz'
import { PageState } from '@gsquiz/shared/gsquiz-types'
import { answerQuiz, nextPage } from '@gsquiz/shared/quizclient'
import { useState } from 'react'
import { useSWRConfig } from 'swr'
import AnswerView from '../answer-view/answer-view'
import QuizView from '../quiz-view/quiz-view'

/* eslint-disable-next-line */
export interface QuizAnswerViewProps {
  state: PageState
}

export function QuizAnswerView({ state }: QuizAnswerViewProps) {
  const { mutate } = useSWRConfig()
  const [_twFadeOut, setTwFadeOut] = useState<string>('')

  const clickChoice = (choiceId: number) => {
    setTwFadeOut('animate-fadeout')
    answerQuiz(choiceId, state, mutate)
  }

  const clickNext = () => {
    setTwFadeOut('animate-fadeout')
    nextPage(state, mutate)
  }

  const twFadeOut = _twFadeOut ? _twFadeOut : ''

  const ViewImpl = (ps: PageState) => {
    if (ps.state === 'question' && ps.qd) {
      return <QuizView qd={ps.qd} onClick={clickChoice} />
    } else if (ps.state === 'answer' && ps.qd) {
      return <AnswerView qd={ps.qd} onClick={clickNext} />
    } else {
      //
      return <div>TODO</div>
    }
  }
  return <div>{ViewImpl(state)}</div>
}

export default QuizAnswerView
