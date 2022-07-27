// import { QuizData } from '@gsquiz/shared/gsquiz'
import { QuizData } from '@gsquiz/shared/gsquiz-types'
import { wait } from '@gsquiz/shared/quizclient'
import { useState } from 'react'
import ChoiceView from '../choice-view/choice-view'
import FadeInOut from '../fade-in-out/fade-in-out'
import RubyText from '../ruby-text/ruby-text'

/* eslint-disable-next-line */
export interface QuizViewProps {
  qd: QuizData
  onClick: (i: number) => void
}

export function QuizView({ qd, onClick }: QuizViewProps) {
  const [fadeout, setFadeout] = useState<boolean>(false)

  return (
    <FadeInOut fadeout={fadeout}>
      <div>
        {/* ヘッダ */}
        <div className="flex flex-row  border-b-2 mb-2 pb-2">
          <div className="grow" />
          <div>クイズ1</div>
          <div className="grow" />
        </div>

        {/* 問題文・解説文 */}
        <div className="flex flex-row">
          <div className="grow" />
          <img
            className="object-contain h-12"
            alt="xxx"
            src="https://firebasestorage.googleapis.com/v0/b/gsumiquiz.appspot.com/o/images%2FASSETS%2Fboya_s.png?alt=media&token=e4f5523d-0eff-4df0-bf13-02ecdcb62ac1"
          />

          <div>
            <RubyText text={qd.question.text} words={qd.question.rubyHtml} />
          </div>
          <div className="grow" />
        </div>

        {/* 問題文画像 */}
        <div className="flex flex-row">
          <div className="grow" />
          <div className="relative after:absolute after:top-0 after:left-0 after:shadow-inner">
            <img
              className="object-cover rounded-xl m-1 h-48"
              alt="xxx"
              src={`images/${qd.id}/a001.jpg`}
            />
          </div>

          <div className="grow" />
        </div>

        {/* 選択肢 */}
        <div className="flex flex-row">
          <div className="grow" />
          <ChoiceView
            qd={qd}
            onClick={async (i) => {
              setFadeout(true)
              await wait(2000)
              onClick(i)
            }}
          />
          <div className="grow" />
        </div>
      </div>
    </FadeInOut>
  )
}

export default QuizView
