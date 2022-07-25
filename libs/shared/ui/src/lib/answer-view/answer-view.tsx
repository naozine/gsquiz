import { QuizData } from '@gsquiz/shared/gsquiz'
import ChoiceView from '../choice-view/choice-view'
import RubyText from '../ruby-text/ruby-text'

/* eslint-disable-next-line */
export interface AnswerViewProps {
  qd: QuizData
  onClick: () => void
}

export function AnswerView({ qd, onClick }: AnswerViewProps) {
  return (
    <div className="flex flex-row opacity-0 animate-fadein">
      <div className="grow" />
      <div className="min-w-[600px]">
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
            <div className="text-red-500 text-3xl">
              <RubyText text={qd.answer.text} words={qd.answer.rubyHtml} />
            </div>
            <div className="text-xl text-blue-500">
              <RubyText text={qd.answer.text2} words={qd.answer.rubyHtml2} />
            </div>
          </div>

          <div className="grow" />
        </div>

        {/* 選択肢 */}
        {/* <div className="flex flex-row">
          <div className="grow" />
          <ChoiceView qd={qd} onClick={onClick} />
          <div className="grow" />
        </div> */}

        {/* 次のページ */}
        <div className="flex flex-row mt-4">
          <div className="grow" />
          <div
            className="text-2xl hover:bg-indigo-100 rounded-md p-2"
            onClick={onClick}
          >
            次のページへ
          </div>
          <div className="grow" />
        </div>
      </div>
      <div className="grow" />
    </div>
  )
}

export default AnswerView
