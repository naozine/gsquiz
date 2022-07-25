import { PageState, PageStateType, QuizData } from '@gsquiz/shared/gsquiz'
import { useState } from 'react'
import AnswerView from '../answer-view/answer-view'
import QuizView from '../quiz-view/quiz-view'

/* eslint-disable-next-line */
export interface QuizAnswerViewProps {
  state: PageState
}

export function QuizAnswerView({ state }: QuizAnswerViewProps) {
  const [_twFadeOut, setTwFadeOut] = useState<string>('')

  const clickChoice = (choiceId: number) => {
    setTwFadeOut('animate-fadeout')
  }

  const clickNext = () => {
    setTwFadeOut('animate-fadeout')
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
  return <div className={twFadeOut}>{ViewImpl(state)}</div>
}

export default QuizAnswerView