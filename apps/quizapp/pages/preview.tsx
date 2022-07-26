import { PageState } from '@gsquiz/shared/gsquiz-types'
import { getQuizDb, usePageState, startQuiz } from '@gsquiz/shared/quizclient'
import { QuizAnswerView } from '@gsquiz/shared/ui'
import { useSWRConfig } from 'swr'

const Func = ({ ps }: { ps: PageState }) => {
  const { mutate } = useSWRConfig()
  if (ps.state === 'question' || ps.state === 'answer') {
    console.log(ps)
    return <QuizAnswerView state={ps} />
  } else {
    return (
      <div>
        <button
          onClick={() => {
            startQuiz(ps, mutate)
          }}
        >
          xxx
        </button>
      </div>
    )
  }
}

const Preview = () => {
  const ps = usePageState()

  // console.log(ps)

  return (
    <div>
      <Func ps={ps} />
    </div>
  )
}
export default Preview
