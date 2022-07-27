// import { QuizData } from '@gsquiz/shared/gsquiz'
import { QuizData } from '@gsquiz/shared/gsquiz-types'
import RubyText from '../ruby-text/ruby-text'

/* eslint-disable-next-line */
export interface ChoiceViewProps {
  qd: QuizData
  onClick?: (id: number) => void
}

export function ChoiceView({ qd, onClick }: ChoiceViewProps) {
  const nums = ['①', '②', '③', '④', '⑤']
  return (
    <div className="flex flex-row">
      {qd.choices.map((choice, i) => {
        return (
          <div
            key={`choice_${i}`}
            className="flex flex-row"
            onClick={() => {
              if (onClick) {
                onClick(i)
              }
            }}
          >
            <div className="mr-0.5">{nums[i]}</div>
            <div className="mr-2">
              <RubyText text={choice.text} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ChoiceView
