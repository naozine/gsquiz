import { QuizData } from '@gsquiz/shared/gsquiz'
import styles from './quiz-view.module.css'

/* eslint-disable-next-line */
export interface QuizViewProps {
  qd: QuizData
}

export function QuizView({ qd }: QuizViewProps) {
  return (
    // <div className="flex flex-row transition-opacity  opacity-0 hover:opacity-100 duration-[2000ms] ease-linear animate-pulse">
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
          <img
            width="45px"
            alt="xxx"
            src="https://firebasestorage.googleapis.com/v0/b/gsumiquiz.appspot.com/o/images%2FASSETS%2Fboya_s.png?alt=media&token=e4f5523d-0eff-4df0-bf13-02ecdcb62ac1"
          />
          <div>
            {'<ruby>サンゴ<rt>さんご<</rt></ruby>'}
            {/* <ruby>
              サンゴ<rt>さんご</rt>
            </ruby>
            <ruby>
              礁<rt>しょう</rt>
            </ruby>
            って知ってる？
            <ruby>
              サンゴ<rt>さんご</rt>
            </ruby>
            <ruby>
              礁<rt>しょう</rt>
            </ruby>
            にはたくさんの生き物が生活しているね。どうしてかな？ */}
          </div>
        </div>
      </div>
      <div className="grow" />
    </div>
  )
}

export default QuizView
