import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })

import { applicationDefault, initializeApp } from 'firebase-admin/app'
import {
  getQuizDatasFromSheetOld,
  rubyHtmlToSpanArray,
  setFirestoreFromSheetOld,
  sharedGsquiz,
  textToRubyHtml,
} from './shared-gsquiz'

describe('sharedGsquiz', () => {
  it('should work', () => {
    expect(sharedGsquiz()).toEqual('shared-gsquiz')
  })

  it('テキストをルビ付きHTMLに変換', () => {
    const html = textToRubyHtml(
      'なぞなぞだよ。つぎのうち、鳥のお友達がいないのは何番かな？'
    )
    console.log(rubyHtmlToSpanArray(html))
    expect(html).toEqual(
      'なぞなぞだよ。つぎのうち、<ruby>鳥<rt>とり</rt></ruby>のお<ruby>友達<rt>ともだち</rt></ruby>がいないのは<ruby>何番<rt>なんばん</rt></ruby>かな？'
    )
  })

  it('テキストをルビ付きHTMLに変換2', () => {
    const html = textToRubyHtml('正解は①サンマだよ。')
    console.log(rubyHtmlToSpanArray(html))
    expect(html).toEqual(
      'なぞなぞだよ。つぎのうち、<ruby>鳥<rt>とり</rt></ruby>のお<ruby>友達<rt>ともだち</rt></ruby>がいないのは<ruby>何番<rt>なんばん</rt></ruby>かな？'
    )
  })

  it('ルビ付きHTMLを配列に変換', () => {
    const array = rubyHtmlToSpanArray(
      '<ruby>青<rt>あお</rt></ruby>い<ruby>空<rt>そら</rt></ruby>'
    )
    expect(array.length).toEqual(3)
    expect(array[0][0]).toEqual('青')
    expect(array[0][1]).toEqual('あお')
    expect(array[1][0]).toEqual('い')
    expect(array[1][1]).toEqual('')
    expect(array[2][0]).toEqual('空')
    expect(array[2][1]).toEqual('そら')
  })

  it('クイズDBロード from old excel', async () => {
    //
    const values = await getQuizDatasFromSheetOld()
  })

  it('OLDフォーマットのクイズDBをFirestoreに書き込み', async () => {
    initializeApp({
      credential: applicationDefault(),
    })
    await setFirestoreFromSheetOld()
  }, 50000)
})
