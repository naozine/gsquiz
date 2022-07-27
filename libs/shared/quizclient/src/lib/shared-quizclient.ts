import {
  DefaultPageState,
  PageState,
  QuizData,
} from '@gsquiz/shared/gsquiz-types'
import useSWR, { useSWRConfig } from 'swr'
import { ScopedMutator } from 'swr/dist/types'
import * as quizdb from './quizdb.json'

export function sharedQuizclient(): string {
  return 'shared-quizclient'
}

export const wait = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const SWRKEY_PageState = 'SWRKEY_PageState'
const SWRKEY_PageStateHist = 'SWRKEY_PageStateHist'

export const usePageState = () => {
  //
  const { data } = useSWR<PageState>(SWRKEY_PageState, null)
  const { data: hist } = useSWR<PageState[]>(SWRKEY_PageStateHist, null)

  const ps = data ? data : DefaultPageState

  return ps
}

export const usePageStateHist = () => {
  const { data } = useSWR<PageState[]>(SWRKEY_PageStateHist, null)
  const hist = data ? data : []

  return hist
}

export const updatePageState = (nextPs: PageState, mutate: ScopedMutator) => {
  mutate<PageState>(SWRKEY_PageState, { ...nextPs })
}

export const startQuiz = (ps: PageState, mutate: ScopedMutator) => {
  // const { mutate } = useSWRConfig()
  if (ps.state === 'start') {
    const newState: PageState = {
      quizNo: 1,
      state: 'question',
      // TODO: ここはランダムに
      qd: quizdb[0],
    }

    mutate<PageState>(SWRKEY_PageState, newState)

    // 新規のスタートなので、過去のヒストリはクリア
    mutate<PageState[]>(SWRKEY_PageStateHist, [])
  }
}

/**
 * 問題ページで、選択肢を選択
 * choiceId: 選択肢のID（0開始）
 */
export const answerQuiz = (
  choiceId: number,
  ps: PageState,
  mutate: ScopedMutator
) => {
  if (ps.state === 'question') {
    const newState: PageState = {
      ...ps,
      state: 'answer',
      yourAnswerId: choiceId,
    }
    mutate<PageState>(SWRKEY_PageState, newState)

    // 解答済みのステートをヒストリに記録
    // const hist = usePageStateHist()
    // mutate<PageState[]>(SWRKEY_PageStateHist, [...hist, newState])
  }
}

const ANSWER_NUM = 5

/**
 * 解答ページで、次のページを選択
 */
export const nextPage = (ps: PageState, mutate: ScopedMutator) => {
  if (ps.state === 'answer') {
    const newState: PageState = {
      quizNo: 0,
      state: 'result',
    }
    mutate<PageState>(SWRKEY_PageState, newState)
    /*
    const hist = usePageStateHist()
    if (hist.length < ANSWER_NUM) {
      // 規定数をこなしてななら、次の問題へ
    } else {
      // 規定数を終了なら、結果ページへ
      const newState: PageState = {
        quizNo: 0,
        state: 'result',
      }
      mutate<PageState>(SWRKEY_PageState, newState)
    }
    */
  }
}

export const getQuizDb = () => {
  const results: QuizData[] = []
  for (let i = 0; i < quizdb.length; ++i) {
    results.push(quizdb[i])
  }
  return results
}
