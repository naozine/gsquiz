import { QuizData } from '@gsquiz/shared/gsquiz'
import { Z_NO_COMPRESSION } from 'zlib'
import ChoiceView from '../choice-view/choice-view'
import RubyText from '../ruby-text/ruby-text'
import styles from './quiz-view.module.css'

/* eslint-disable-next-line */
export interface QuizViewProps {
  qd: QuizData
  onClick: (i: number) => void
}

//const parser = new DOMParser();
const rubyHtmlToSpanArray = (html: string) => {
  const parser = new DOMParser()
  const root = parser.parseFromString(html, 'text/html')

  const nodes = root.childNodes

  const results: string[][] = []

  const nls = (s: string | null) => (s ? s : '')

  nodes.forEach((n) => {
    const nodes2 = n.childNodes
    if (nodes2.length > 0) {
      results.push([
        nls(nodes2.item(1).textContent),
        nls(nodes2.item(0).textContent),
      ])
    } else {
      results.push([nls(n.textContent), ''])
    }
  })

  return results

  // return root.childNodes.map((n) => {
  //   if (n.childNodes.length > 0) {
  //     return n.childNodes.map((nn) => {
  //       return nn.text
  //     })
  //   }
  //   return [n.text, '']
  // })
}

export function QuizView({ qd, onClick }: QuizViewProps) {
  // const text = [['青い空', 'あおいそら']]

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

        {/* 選択肢 */}
        <div className="flex flex-row">
          <div className="grow" />
          <ChoiceView qd={qd} onClick={onClick} />
          <div className="grow" />
        </div>
      </div>
      <div className="grow" />
    </div>
  )
}

export default QuizView
