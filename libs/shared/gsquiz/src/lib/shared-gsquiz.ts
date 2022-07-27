import { google } from 'googleapis'
import { parse } from 'node-html-parser'
import { getFirestore } from 'firebase-admin/firestore'
import * as fs from 'fs'
import { QuizData } from '@gsquiz/shared/gsquiz-types'

export function sharedGsquiz(): string {
  return 'shared-gsquiz'
}

const ssauth = async () => {
  const keyFile = process.env['GOOGLE_SHEETS_API_CREDENTIALS']

  if (keyFile) {
    const auth = await google.auth.getClient({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    return auth
  } else {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    return auth
  }
}

export const getSheetValue = async (spreadsheetId: string, range: string) => {
  const apiOptions = {
    auth: await ssauth(),
    spreadsheetId,
    range,
  }

  const ret = await google.sheets('v4').spreadsheets.values.get(apiOptions)
  return ret.data.values as string[][]
}

export const getQuizDatasFromSheet = async () => {
  // const sid = process.env['QUIZ_DATA_SHEET_ID'] as string
  // TODO 正式には、firestoreの設定用ドキュメントなどから取得
  const sid = '1-KEs8GFaZGXNe7WiExFET2Xe91xFK8ORF_Xg_MnpPKo'
  const values = await getSheetValue(sid, 'クイズデータ!A3:X')

  const start_field = 1

  const datas = values.map((f) => {
    const qd: QuizData = {
      id: f[start_field - 1],
      question: {
        text: f[start_field],
      },
      choices: [
        {
          text: f[start_field + 2],
          correct: f[start_field + 3] === 'TRUE',
        },
        {
          text: f[start_field + 5],
          correct: f[start_field + 6] === 'TRUE',
        },
        {
          text: f[start_field + 8],
          correct: f[start_field + 9] === 'TRUE',
        },
        {
          text: f[start_field + 11],
          correct: f[start_field + 12] === 'TRUE',
        },
        {
          text: f[start_field + 14],
          correct: f[start_field + 15] === 'TRUE',
        },
      ],
      answer: {
        text: f[start_field + 17],
      },
    }
    return qd
  })

  return datas
}

export const getQuizDatasFromSheetOld = async () => {
  const sid = '1lp9v6tLjMtgl83DN7AWyIx6q6WtLtim6Oxd6LTjKcio'
  const values = await getSheetValue(sid, 'クイズDB!A12:L100')

  const results: QuizData[] = []
  let lastQrecord: string[] = []
  for (const flds of values) {
    const type = flds[1]
    if (type === '問題') {
      lastQrecord = flds
    } else if (type === '解答') {
      console.log(lastQrecord[8])
      const qd: QuizData = {
        id: lastQrecord[0],
        question: {
          text: lastQrecord[5],
        },
        choices: lastQrecord[6].split('\n').map((ctext, i) => {
          return {
            text: ctext,
            correct: lastQrecord[8]
              ? // ? lastQrecord[8].indexOf('' + (i + 1)) > 0
                lastQrecord[8] === String(i + 1)
              : false,
          }
        }),
        answer: {
          text: flds[4],
          text2: flds[5],
        },
      }
      results.push(qd)
      lastQrecord = []
    }
  }

  // console.log(JSON.stringify(results, null, '\t'))
  return results
}

export const textToRubyHtml = (text: string) => {
  const dict: { [id: string]: string } = {
    青い空: '<ruby>青<rt>あお</rt></ruby>い<ruby>空<rt>そら</rt></ruby>',
    ようこそ: 'ようこそ',
    'こんにちは。\n今日はぼくたちの部屋へあそびに来てくれて、ありがとう。これからクイズを5問出すよ。答えがわかったら、正しい答えの数字を押してね。':
      'こんにちは。\n<ruby>今日<rt>きょう</rt></ruby>はぼくたちの<ruby>部屋<rt>へや</rt></ruby>へあそびに<ruby>来<rt>き</rt></ruby>てくれて、ありがとう。これからクイズを5<ruby>問<rt>もん</rt></ruby><ruby>出<rt>だ</rt></ruby>すよ。<ruby>答<rt>こた</rt></ruby>えがわかったら、<ruby>正<rt>ただ</rt></ruby>しい<ruby>答<rt>こた</rt></ruby>えの<ruby>数字<rt>すうじ</rt></ruby>を<ruby>押<rt>お</rt></ruby>してね。',
    '準備はいいかな？': '<ruby>準備<rt>じゅんび</rt></ruby>はいいかな？',
    'これから君にぴったりのクイズを出すから次の２つから君の学校の番号を選んでね。':
      'これから<ruby>君<rt>きみ</rt></ruby>にぴったりのクイズを<ruby>出<rt>だ</rt></ruby>すから<ruby>次<rt>つぎ</rt></ruby>の２つから<ruby>君<rt>きみ</rt></ruby>の<ruby>学校<rt>がっこう</rt></ruby>の<ruby>番<rt>ばん</rt></ruby><ruby>号<rt>ごう</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んでね。',
    '①小学校\n②中学校':
      '①<ruby>小学校<rt>しょうがっこう</rt></ruby>\n②<ruby>中学校<rt>ちゅうがっこう</rt></ruby>',
    クイズの結果は: 'クイズの<ruby>結果<rt>けっか</rt></ruby>は',
    'おめでとう！\n5問中5問正解で100点だよ\nこれからも海のことたくさん勉強してね。':
      'おめでとう！\n5<ruby>問<rt>もん</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>5<ruby>問<rt>もん</rt></ruby><ruby>正解<rt>せいかい</rt></ruby>で100<ruby>点<rt>てん</rt></ruby>だよ\nこれからも<ruby>海<rt>うみ</rt></ruby>のことたくさん<ruby>勉強<rt>べんきょう</rt></ruby>してね。',
    '①クイズを終わる\n②スタートにもどる':
      '①クイズを<ruby>終<rt>お</rt></ruby>わる\n②スタートにもどる',
    'もうちょと。惜しかったね！\n5問中4問正解で80点だよ\nこれからも海のことたくさん勉強してね。':
      'もうちょと。<ruby>惜<rt>お</rt></ruby>しかったね！\n5<ruby>問<rt>もん</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>4<ruby>問<rt>もん</rt></ruby><ruby>正解<rt>せいかい</rt></ruby>で80<ruby>点<rt>てん</rt></ruby>だよ\nこれからも<ruby>海<rt>うみ</rt></ruby>のことたくさん<ruby>勉強<rt>べんきょう</rt></ruby>してね。',
    'どうだった？難しかった？\n5問中3問正解で60点だよ\nこれからも海のことたくさん勉強してね。':
      'どうだった？<ruby>難<rt>むずか</rt></ruby>しかった？\n5<ruby>問<rt>もん</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>3<ruby>問<rt>もん</rt></ruby><ruby>正解<rt>せいかい</rt></ruby>で60<ruby>点<rt>てん</rt></ruby>だよ\nこれからも<ruby>海<rt>うみ</rt></ruby>のことたくさん<ruby>勉強<rt>べんきょう</rt></ruby>してね。',
    '難しかったかな？\n5問中2問正解で40点だよ\nぼくの部屋へまたあそびに来てね。':
      '<ruby>難<rt>むずか</rt></ruby>しかったかな？\n5<ruby>問<rt>もん</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>2<ruby>問<rt>もん</rt></ruby><ruby>正解<rt>せいかい</rt></ruby>で40<ruby>点<rt>てん</rt></ruby>だよ\nぼくの<ruby>部屋<rt>へや</rt></ruby>へまたあそびに<ruby>来<rt>き</rt></ruby>てね。',
    'また挑戦してね！\n5問中1問正解で20点だよ\nぼくの部屋へまたあそびに来てね。':
      'また<ruby>挑戦<rt>ちょうせん</rt></ruby>してね！\n5<ruby>問<rt>もん</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>1<ruby>問<rt>もん</rt></ruby><ruby>正解<rt>せいかい</rt></ruby>で20<ruby>点<rt>てん</rt></ruby>だよ\nぼくの<ruby>部屋<rt>へや</rt></ruby>へまたあそびに<ruby>来<rt>き</rt></ruby>てね。',
    'また挑戦してね！\n5問中0問正解だよ\nぼくの部屋へまたあそびに来てね。':
      'また<ruby>挑戦<rt>ちょうせん</rt></ruby>してね！\n5<ruby>問<rt>もん</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>0<ruby>問<rt>もん</rt></ruby><ruby>正解<rt>せいかい</rt></ruby>だよ\nぼくの<ruby>部屋<rt>へや</rt></ruby>へまたあそびに<ruby>来<rt>き</rt></ruby>てね。',
    クイズ: 'クイズ',
    '海って聞くと、ぼくは食いしん坊だからすぐに魚や貝を思い浮かべちゃうんだ。\n　いま、日本人がよく食べている魚の1位はサケで、2位がマグロなんだって。下の絵の中で、どれがマグロかわかるかな。正しいのは何番？':
      '<ruby>海<rt>うみ</rt></ruby>って<ruby>聞<rt>き</rt></ruby>くと、ぼくは<ruby>食<rt>た</rt></ruby>いしん<ruby>坊<rt>ぼう</rt></ruby>だからすぐに<ruby>魚<rt>さかな</rt></ruby>や<ruby>貝<rt>かい</rt></ruby>を<ruby>思<rt>おも</rt></ruby>い<ruby>浮<rt>う</rt></ruby>かべちゃうんだ。\n　いま、<ruby>日本<rt>にほん</rt></ruby><ruby>人<rt>ひと</rt></ruby>がよく<ruby>食<rt>た</rt></ruby>べている<ruby>魚<rt>さかな</rt></ruby>の1<ruby>位<rt>い</rt></ruby>はサケで、2<ruby>位<rt>い</rt></ruby>がマグロなんだって。<ruby>下<rt>した</rt></ruby>の<ruby>絵<rt>え</rt></ruby>の<ruby>中<rt>なか</rt></ruby>で、どれがマグロかわかるかな。<ruby>正<rt>ただ</rt></ruby>しいのは<ruby>何番<rt>なんばん</rt></ruby>？',
    '①\n②\n③': '①\n②\n③',
    '2': '2',
    'こたえは②': 'こたえは②',
    '①サケ\n②マグロ\n③ブリ': '①サケ\n②マグロ\n③ブリ',
    'マグロは海の中でどんなものを食べているんだろう。下の３つの中から正しいと思う番号を選んでね。':
      'マグロは<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>でどんなものを<ruby>食<rt>た</rt></ruby>べているんだろう。<ruby>下<rt>した</rt></ruby>の３つの<ruby>中<rt>なか</rt></ruby>から<ruby>正<rt>ただ</rt></ruby>しいと<ruby>思<rt>おも</rt></ruby>う<ruby>番<rt>ばん</rt></ruby><ruby>号<rt>ごう</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んでね。',
    '①イワシ\n②ジンベイザメ\n③シャチ': '①イワシ\n②ジンベイザメ\n③シャチ',
    '1': '1',
    'こたえは①イワシ': 'こたえは①イワシ',
    'マグロは自分よりも小さなイワシなどを食べるんだね。そのイワシは動物プランクトンを食べ、動物プランクトンは植物プランクトンを食べるんだ。みんなの口にマグロが届くまでに、海の中では何回食べたり、食べられたりをくり返すのかな。　':
      'マグロは<ruby>自分<rt>じぶん</rt></ruby>よりも<ruby>小<rt>ちい</rt></ruby>さなイワシなどを<ruby>食<rt>た</rt></ruby>べるんだね。そのイワシは<ruby>動物<rt>どうぶつ</rt></ruby>プランクトンを<ruby>食<rt>た</rt></ruby>べ、<ruby>動物<rt>どうぶつ</rt></ruby>プランクトンは<ruby>植物<rt>しょくぶつ</rt></ruby>プランクトンを<ruby>食<rt>た</rt></ruby>べるんだ。みんなの<ruby>口<rt>くち</rt></ruby>にマグロが<ruby>届<rt>とど</rt></ruby>くまでに、<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>では<ruby>何回<rt>なんかい</rt></ruby><ruby>食<rt>た</rt></ruby>べたり、<ruby>食<rt>た</rt></ruby>べられたりをくり<ruby>返<rt>かえ</rt></ruby>すのかな。　',
    '日本は海に囲まれているけど、漁業をしたり、石油などの天然資源を掘ったりという活動を他の国に邪魔じゃまされずに自由に行える水域（排他的経済水域）が日本にはどれくらいあると思う？正しい答えの番号を選んでね。':
      '<ruby>日本<rt>にほん</rt></ruby>は<ruby>海<rt>うみ</rt></ruby>に<ruby>囲<rt>かこ</rt></ruby>まれているけど、<ruby>漁業<rt>ぎょぎょう</rt></ruby>をしたり、<ruby>石油<rt>せきゆ</rt></ruby>などの<ruby>天然<rt>てんねん</rt></ruby><ruby>資源<rt>しげん</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>ったりという<ruby>活動<rt>かつどう</rt></ruby>を<ruby>他<rt>ほか</rt></ruby>の<ruby>国<rt>くに</rt></ruby>に<ruby>邪魔<rt>じゃま</rt></ruby>じゃまされずに<ruby>自由<rt>じゆう</rt></ruby>に<ruby>行<rt>おこな</rt></ruby>える<ruby>水域<rt>すいいき</rt></ruby>（<ruby>排他的<rt>はいたてき</rt></ruby><ruby>経済<rt>けいざい</rt></ruby><ruby>水域<rt>すいいき</rt></ruby>）が<ruby>日本<rt>にほん</rt></ruby>にはどれくらいあると<ruby>思<rt>おも</rt></ruby>う？<ruby>正<rt>ただ</rt></ruby>しい<ruby>答<rt>こた</rt></ruby>えの<ruby>番<rt>ばん</rt></ruby><ruby>号<rt>ごう</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んでね。',
    '①約38万平方キロメートル（領海を含む）\n②約447万平方キロメートル（領海を含む）\n③約762万平方キロメートル（領海を含む）':
      '①<ruby>約<rt>やく</rt></ruby>38<ruby>万<rt>まん</rt></ruby><ruby>平方<rt>へいほう</rt></ruby>キロメートル（<ruby>領海<rt>りょうかい</rt></ruby>を<ruby>含<rt>ふく</rt></ruby>む）\n②<ruby>約<rt>やく</rt></ruby>447<ruby>万<rt>まん</rt></ruby><ruby>平方<rt>へいほう</rt></ruby>キロメートル（<ruby>領海<rt>りょうかい</rt></ruby>を<ruby>含<rt>ふく</rt></ruby>む）\n③<ruby>約<rt>やく</rt></ruby>762<ruby>万<rt>まん</rt></ruby><ruby>平方<rt>へいほう</rt></ruby>キロメートル（<ruby>領海<rt>りょうかい</rt></ruby>を<ruby>含<rt>ふく</rt></ruby>む）',
    '正解は②の約447万平方キロメートル！':
      '<ruby>正解<rt>せいかい</rt></ruby>は②の<ruby>約<rt>やく</rt></ruby>447<ruby>万<rt>まん</rt></ruby><ruby>平方<rt>へいほう</rt></ruby>キロメートル！',
    '日本の国土の面積の約12倍になるんだって、すごいね。世界の中で6番目に広いよ。':
      '<ruby>日本<rt>にほん</rt></ruby>の<ruby>国土<rt>こくど</rt></ruby>の<ruby>面積<rt>めんせき</rt></ruby>の<ruby>約<rt>やく</rt></ruby>12<ruby>倍<rt>ばい</rt></ruby>になるんだって、すごいね。<ruby>世界<rt>せかい</rt></ruby>の<ruby>中<rt>なか</rt></ruby>で6<ruby>番目<rt>ばんめ</rt></ruby>に<ruby>広<rt>ひろ</rt></ruby>いよ。',
    'みんなはお魚好き？ぼくは、大好き。日本の近海には、約3,700種の魚が生息しているんだ。これは世界の約15,000種といわれる海水魚のうち約25％に当たるよ。\nでは、日本の海に、イルカやアザラシなど海で生活する哺乳類は何種いるでしょう。正しいと思う数字を選んでね。':
      'みんなはお<ruby>魚<rt>さかな</rt></ruby><ruby>好<rt>ず</rt></ruby>き？ぼくは、<ruby>大好<rt>だいす</rt></ruby>き。<ruby>日本<rt>にほん</rt></ruby>の<ruby>近海<rt>きんかい</rt></ruby>には、<ruby>約<rt>やく</rt></ruby>3,700<ruby>種<rt>しゅ</rt></ruby>の<ruby>魚<rt>さかな</rt></ruby>が<ruby>生息<rt>せいそく</rt></ruby>しているんだ。これは<ruby>世界<rt>せかい</rt></ruby>の<ruby>約<rt>やく</rt></ruby>15,000<ruby>種<rt>しゅ</rt></ruby>といわれる<ruby>海水魚<rt>かいすいぎょ</rt></ruby>のうち<ruby>約<rt>やく</rt></ruby>25％に<ruby>当<rt>あ</rt></ruby>たるよ。\nでは、<ruby>日本<rt>にほん</rt></ruby>の<ruby>海<rt>うみ</rt></ruby>に、イルカやアザラシなど<ruby>海<rt>うみ</rt></ruby>で<ruby>生活<rt>せいかつ</rt></ruby>する<ruby>哺乳類<rt>ほにゅうるい</rt></ruby>は<ruby>何種<rt>なにしゅ</rt></ruby>いるでしょう。<ruby>正<rt>ただ</rt></ruby>しいと<ruby>思<rt>おも</rt></ruby>う<ruby>数字<rt>すうじ</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んでね。',
    '①50種\n②70種\n③35種':
      '①50<ruby>種<rt>しゅ</rt></ruby>\n②70<ruby>種<rt>しゅ</rt></ruby>\n③35<ruby>種<rt>しゅ</rt></ruby>',
    '正解は①の50種だよ':
      '<ruby>正解<rt>せいかい</rt></ruby>は①の50<ruby>種<rt>しゅ</rt></ruby>だよ',
    '世界の海に生息する112種の哺乳類のうち約45％の種が日本の海にもいるんだね。':
      '<ruby>世界<rt>せかい</rt></ruby>の<ruby>海<rt>うみ</rt></ruby>に<ruby>生息<rt>せいそく</rt></ruby>する112<ruby>種<rt>たね</rt></ruby>の<ruby>哺乳類<rt>ほにゅうるい</rt></ruby>のうち<ruby>約<rt>やく</rt></ruby>45％の<ruby>種<rt>たね</rt></ruby>が<ruby>日本<rt>にほん</rt></ruby>の<ruby>海<rt>うみ</rt></ruby>にもいるんだね。',
    '建設業って知ってる？':
      '<ruby>建設<rt>けんせつ</rt></ruby><ruby>業<rt>ぎょう</rt></ruby>って<ruby>知<rt>し</rt></ruby>ってる？',
    '建設業ってどんな仕事をしているか知っているかな？\n次のうち当てはまると思う仕事を全部選んでね。':
      '<ruby>建設<rt>けんせつ</rt></ruby><ruby>業<rt>ぎょう</rt></ruby>ってどんな<ruby>仕事<rt>しごと</rt></ruby>をしているか<ruby>知<rt>し</rt></ruby>っているかな？\n<ruby>次<rt>つぎ</rt></ruby>のうち<ruby>当<rt>あ</rt></ruby>てはまると<ruby>思<rt>おも</rt></ruby>う<ruby>仕事<rt>しごと</rt></ruby>を<ruby>全部<rt>ぜんぶ</rt></ruby><ruby>選<rt>えら</rt></ruby>んでね。',
    '①空港や港をつくる\n②ビルなどの建物をつくる\n③道路やトンネルをつくる\n④橋をかける\n⑤ダムをつくる\n⑥堤防をつくる':
      '①<ruby>空港<rt>くうこう</rt></ruby>や<ruby>港<rt>みなと</rt></ruby>をつくる\n②ビルなどの<ruby>建物<rt>たてもの</rt></ruby>をつくる\n③<ruby>道路<rt>どうろ</rt></ruby>やトンネルをつくる\n④<ruby>橋<rt>ばし</rt></ruby>をかける\n⑤ダムをつくる\n⑥<ruby>堤防<rt>ていぼう</rt></ruby>をつくる',
    問題文テキスト: '<ruby>問題文<rt>もんだいぶん</rt></ruby>テキスト',
    '①選択肢１\n②選択肢２\n③選択肢３':
      '①<ruby>選択肢<rt>せんたくし</rt></ruby>１\n②<ruby>選択肢<rt>せんたくし</rt></ruby>２\n③<ruby>選択肢<rt>せんたくし</rt></ruby>３',
    解答テキスト: '<ruby>解答<rt>かいとう</rt></ruby>テキスト',
    'これから君にぴったりのクイズを出すから\n次の２つから君の学校の番号を選んでね。':
      'これから<ruby>君<rt>きみ</rt></ruby>にぴったりのクイズを<ruby>出<rt>だ</rt></ruby>すから\n<ruby>次<rt>つぎ</rt></ruby>の２つから<ruby>君<rt>きみ</rt></ruby>の<ruby>学校<rt>がっこう</rt></ruby>の<ruby>番<rt>ばん</rt></ruby><ruby>号<rt>ごう</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んでね。',
    'おめでとう！\n5問中5問正解で100点だよ\nこれからも海のこといっしょに勉強しようね。':
      'おめでとう！\n5<ruby>問<rt>もん</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>5<ruby>問<rt>もん</rt></ruby><ruby>正解<rt>せいかい</rt></ruby>で100<ruby>点<rt>てん</rt></ruby>だよ\nこれからも<ruby>海<rt>うみ</rt></ruby>のこといっしょに<ruby>勉強<rt>べんきょう</rt></ruby>しようね。',
    'もうちょと。惜しかったね！\n5問中4問正解で80点だよ\nこれからも海のこといっしょに勉強しようね。':
      'もうちょと。<ruby>惜<rt>お</rt></ruby>しかったね！\n5<ruby>問<rt>もん</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>4<ruby>問<rt>もん</rt></ruby><ruby>正解<rt>せいかい</rt></ruby>で80<ruby>点<rt>てん</rt></ruby>だよ\nこれからも<ruby>海<rt>うみ</rt></ruby>のこといっしょに<ruby>勉強<rt>べんきょう</rt></ruby>しようね。',
    'ぼくたちが食べている魚の多くが海外から輸入されているんだって。世界中の海で食事しているみたいだね。':
      'ぼくたちが<ruby>食<rt>た</rt></ruby>べている<ruby>魚<rt>さかな</rt></ruby>の<ruby>多<rt>おお</rt></ruby>くが<ruby>海外<rt>かいがい</rt></ruby>から<ruby>輸入<rt>ゆにゅう</rt></ruby>されているんだって。<ruby>世界<rt>せかい</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>の<ruby>海<rt>うみ</rt></ruby>で<ruby>食事<rt>しょくじ</rt></ruby>しているみたいだね。',
    'マグロは自分よりも小さなイワシなどを食べるんだね。そのイワシはさらに小さなプランクトンを食べるんだ。みんなの口にマグロが届くまでに、海の中では食べたり、食べられたりを何回くり返すのかな。　':
      'マグロは<ruby>自分<rt>じぶん</rt></ruby>よりも<ruby>小<rt>ちい</rt></ruby>さなイワシなどを<ruby>食<rt>た</rt></ruby>べるんだね。そのイワシはさらに<ruby>小<rt>ちい</rt></ruby>さなプランクトンを<ruby>食<rt>た</rt></ruby>べるんだ。みんなの<ruby>口<rt>くち</rt></ruby>にマグロが<ruby>届<rt>とど</rt></ruby>くまでに、<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>では<ruby>食<rt>た</rt></ruby>べたり、<ruby>食<rt>た</rt></ruby>べられたりを<ruby>何回<rt>なんかい</rt></ruby>くり<ruby>返<rt>かえ</rt></ruby>すのかな。　',
    'サンゴ礁って知ってる？サンゴ礁にはたくさんの生き物は生活しているね。どうしてかな？':
      '<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>って<ruby>知<rt>し</rt></ruby>ってる？<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>にはたくさんの<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>は<ruby>生活<rt>せいかつ</rt></ruby>しているね。どうしてかな？',
    '①エサや隠れる場所があるから\n②光がまったく届かない真っ暗な海底にあって落ち着くから。\n③サンゴ礁が魚たちを乗せて水中を移動するから。':
      '①エサや<ruby>隠<rt>かく</rt></ruby>れる<ruby>場所<rt>ばしょ</rt></ruby>があるから\n②<ruby>光<rt>ひかり</rt></ruby>がまったく<ruby>届<rt>とど</rt></ruby>かない<ruby>真<rt>ま</rt></ruby>っ<ruby>暗<rt>くら</rt></ruby>な<ruby>海底<rt>かいてい</rt></ruby>にあって<ruby>落<rt>お</rt></ruby>ち<ruby>着<rt>つ</rt></ruby>くから。\n③<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>が<ruby>魚<rt>さかな</rt></ruby>たちを<ruby>乗<rt>の</rt></ruby>せて<ruby>水中<rt>すいちゅう</rt></ruby>を<ruby>移動<rt>いどう</rt></ruby>するから。',
    '正解は①だよ': '<ruby>正解<rt>せいかい</rt></ruby>は①だよ',
    'サンゴ礁は光の届く浅い海にあって、水中を移動しないんだ。エサや隠れる場所があるからたくさんの生き物が集まってくるんだ。':
      '<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>は<ruby>光<rt>ひかり</rt></ruby>の<ruby>届<rt>とど</rt></ruby>く<ruby>浅<rt>あさ</rt></ruby>い<ruby>海<rt>うみ</rt></ruby>にあって、<ruby>水中<rt>すいちゅう</rt></ruby>を<ruby>移動<rt>いどう</rt></ruby>しないんだ。エサや<ruby>隠<rt>かく</rt></ruby>れる<ruby>場所<rt>ばしょ</rt></ruby>があるからたくさんの<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>集<rt>あつ</rt></ruby>まってくるんだ。',
    '次のうちアサリはどれかな？':
      '<ruby>次<rt>つぎ</rt></ruby>のうちアサリはどれかな？',
    '正解は①　アサリは、お味噌汁やパスタ、いろいろな料理に入っていて、おいしいよね。潮干狩りに行ったことはある？砂の中からアサリを見つけるのは、楽しいよ。':
      '<ruby>正解<rt>せいかい</rt></ruby>は①　アサリは、お<ruby>味噌汁<rt>みそしる</rt></ruby>やパスタ、いろいろな<ruby>料理<rt>りょうり</rt></ruby>に<ruby>入<rt>はい</rt></ruby>っていて、おいしいよね。<ruby>潮干<rt>しおひ</rt></ruby><ruby>狩<rt>か</rt></ruby>りに<ruby>行<rt>い</rt></ruby>ったことはある？<ruby>砂<rt>すな</rt></ruby>の<ruby>中<rt>なか</rt></ruby>からアサリを<ruby>見<rt>み</rt></ruby>つけるのは、<ruby>楽<rt>たの</rt></ruby>しいよ。',
    'アサリは海水を体の中に吸い込んで、海水の濁りの原因になるものを食べてくれるんだ。海をきれいにしてくれるんだね。':
      'アサリは<ruby>海水<rt>かいすい</rt></ruby>を<ruby>体<rt>からだ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>に<ruby>吸<rt>す</rt></ruby>い<ruby>込<rt>こ</rt></ruby>んで、<ruby>海水<rt>かいすい</rt></ruby>の<ruby>濁<rt>にご</rt></ruby>りの<ruby>原因<rt>げんいん</rt></ruby>になるものを<ruby>食<rt>た</rt></ruby>べてくれるんだ。<ruby>海<rt>うみ</rt></ruby>をきれいにしてくれるんだね。',
    'かくれんぼしているこの黄色い動物はなんだ？':
      'かくれんぼしているこの<ruby>黄色<rt>きいろ</rt></ruby>い<ruby>動物<rt>どうぶつ</rt></ruby>はなんだ？',
    '①ナマコ\n②ウツボ\n③ヒトデ': '①ナマコ\n②ウツボ\n③ヒトデ',
    '3': '3',
    '正解は③のヒトデだよ': '<ruby>正解<rt>せいかい</rt></ruby>は③のヒトデだよ',
    'ヒトデは胃を体の外に出して食事をするんだって。貝を食べたり、サンゴを食べる仲間もいるよ。ヒトデ類の多くは、胃袋を口から出して餌を覆って、消化液を出して溶かして吸収するんだって。':
      'ヒトデは<ruby>胃<rt>い</rt></ruby>を<ruby>体<rt>からだ</rt></ruby>の<ruby>外<rt>そと</rt></ruby>に<ruby>出<rt>だ</rt></ruby>して<ruby>食事<rt>しょくじ</rt></ruby>をするんだって。<ruby>貝<rt>かい</rt></ruby>を<ruby>食<rt>た</rt></ruby>べたり、サンゴを<ruby>食<rt>た</rt></ruby>べる<ruby>仲間<rt>なかま</rt></ruby>もいるよ。ヒトデ<ruby>類<rt>るい</rt></ruby>の<ruby>多<rt>おお</rt></ruby>くは、<ruby>胃袋<rt>いぶくろ</rt></ruby>を<ruby>口<rt>くち</rt></ruby>から<ruby>出<rt>だ</rt></ruby>して<ruby>餌<rt>えさ</rt></ruby>を<ruby>覆<rt>おお</rt></ruby>って、<ruby>消化液<rt>しょうかえき</rt></ruby>を<ruby>出<rt>だ</rt></ruby>して<ruby>溶<rt>と</rt></ruby>かして<ruby>吸収<rt>きゅうしゅう</rt></ruby>するんだって。',
    'イカの吸盤はどっちかな？':
      'イカの<ruby>吸盤<rt>きゅうばん</rt></ruby>はどっちかな？',
    '①\n②\n': '①\n②\n',
    '正解は②だよ。': '<ruby>正解<rt>せいかい</rt></ruby>は②だよ。',
    'イカの吸盤の内側は、ギザギザになっていて餌を捕まえやすくなっているんだ。\n生き物のカラダには、いろいろな工夫があって、面白いね。':
      'イカの<ruby>吸盤<rt>きゅうばん</rt></ruby>の<ruby>内側<rt>うちがわ</rt></ruby>は、ギザギザになっていて<ruby>餌<rt>えさ</rt></ruby>を<ruby>捕<rt>つか</rt></ruby>まえやすくなっているんだ。\n<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>のカラダには、いろいろな<ruby>工夫<rt>くふう</rt></ruby>があって、<ruby>面白<rt>おもしろ</rt></ruby>いね。',
    'この機械はどんなことができるかな？':
      'この<ruby>機械<rt>きかい</rt></ruby>はどんなことができるかな？',
    '①海の中を自由に泳ぐことができる。\n②海の中で石を運んで並べたり、ならすことができる。\n③海の中でコマのようにくるくる回ることができる。':
      '①<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>を<ruby>自由<rt>じゆう</rt></ruby>に<ruby>泳<rt>およ</rt></ruby>ぐことができる。\n②<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>で<ruby>石<rt>いし</rt></ruby>を<ruby>運<rt>はこ</rt></ruby>んで<ruby>並<rt>なら</rt></ruby>べたり、ならすことができる。\n③<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>でコマのようにくるくる<ruby>回<rt>まわ</rt></ruby>ることができる。',
    '正解は②だよ。水中バックホウていうんだよ。':
      '<ruby>正解<rt>せいかい</rt></ruby>は②だよ。<ruby>水中<rt>すいちゅう</rt></ruby>バックホウていうんだよ。',
    '港を造るとき、水の中ではこんな機械が活躍しているんだ。人が乗らずに遠くから操作して、動かすこともできるんだよ。\n写真の水中バックホウは模型で、みんなにも操作を体験してもらえるよ。\n':
      '<ruby>港<rt>みなと</rt></ruby>を<ruby>造<rt>つく</rt></ruby>るとき、<ruby>水<rt>みず</rt></ruby>の<ruby>中<rt>なか</rt></ruby>ではこんな<ruby>機械<rt>きかい</rt></ruby>が<ruby>活躍<rt>かつやく</rt></ruby>しているんだ。<ruby>人<rt>ひと</rt></ruby>が<ruby>乗<rt>の</rt></ruby>らずに<ruby>遠<rt>とお</rt></ruby>くから<ruby>操作<rt>そうさ</rt></ruby>して、<ruby>動<rt>うご</rt></ruby>かすこともできるんだよ。\n<ruby>写真<rt>しゃしん</rt></ruby>の<ruby>水中<rt>すいちゅう</rt></ruby>バックホウは<ruby>模型<rt>もけい</rt></ruby>で、みんなにも<ruby>操作<rt>そうさ</rt></ruby>を<ruby>体験<rt>たいけん</rt></ruby>してもらえるよ。\n',
    'この中から3つ選んでしりとりを完成させたとき、最後の文字は何番になるかな？':
      'この<ruby>中<rt>なか</rt></ruby>から3つ<ruby>選<rt>えら</rt></ruby>んでしりとりを<ruby>完成<rt>かんせい</rt></ruby>させたとき、<ruby>最後<rt>さいご</rt></ruby>の<ruby>文字<rt>もじ</rt></ruby>は<ruby>何番<rt>なんばん</rt></ruby>になるかな？',
    '①オ\n②ニ\n③コ': '①オ\n②ニ\n③コ',
    '正解は②ニだよ。': '<ruby>正解<rt>せいかい</rt></ruby>は②ニだよ。',
    'タイ→イカ→カニとなるから、ニだね。': 'タイ→イカ→カニとなるから、ニだね。',
    'カクレクマノミは何番かな？':
      'カクレクマノミは<ruby>何番<rt>なんばん</rt></ruby>かな？',
    '正解は③だよ。': '<ruby>正解<rt>せいかい</rt></ruby>は③だよ。',
    'イソギンチャクは魚などを刺して毒でしびれさせて餌するんだけど、カクレクマノミは特別な粘液で体が覆われているから、刺されることがないんだって。':
      'イソギンチャクは<ruby>魚<rt>さかな</rt></ruby>などを<ruby>刺<rt>さ</rt></ruby>して<ruby>毒<rt>どく</rt></ruby>でしびれさせて<ruby>餌<rt>えさ</rt></ruby>するんだけど、カクレクマノミは<ruby>特別<rt>とくべつ</rt></ruby>な<ruby>粘液<rt>ねんえき</rt></ruby>で<ruby>体<rt>からだ</rt></ruby>が<ruby>覆<rt>おお</rt></ruby>われているから、<ruby>刺<rt>さ</rt></ruby>されることがないんだって。',
    '世界の海にイカは何種類いると思う？':
      '<ruby>世界<rt>せかい</rt></ruby>の<ruby>海<rt>うみ</rt></ruby>にイカは<ruby>何種類<rt>なんしゅるい</rt></ruby>いると<ruby>思<rt>おも</rt></ruby>う？',
    '①およそ160種類\n②およそ280種類\n③およそ450種類':
      '①およそ160<ruby>種類<rt>しゅるい</rt></ruby>\n②およそ280<ruby>種類<rt>しゅるい</rt></ruby>\n③およそ450<ruby>種類<rt>しゅるい</rt></ruby>',
    '正解は③450種類いるんだよ。':
      '<ruby>正解<rt>せいかい</rt></ruby>は③450<ruby>種類<rt>しゅるい</rt></ruby>いるんだよ。',
    'そのうち日本には140種くらいのイカがいるんだって。':
      'そのうち<ruby>日本<rt>にほん</rt></ruby>には140<ruby>種<rt>しゅ</rt></ruby>くらいのイカがいるんだって。',
    'これは海で何をする道具かな。':
      'これは<ruby>海<rt>うみ</rt></ruby>で<ruby>何<rt>なに</rt></ruby>をする<ruby>道具<rt>どうぐ</rt></ruby>かな。',
    '①魚をおびき寄せて魚を獲る道具\n②海底を掘る道具\n③キレイな海水を運ぶ道具':
      '①<ruby>魚<rt>さかな</rt></ruby>をおびき<ruby>寄<rt>よ</rt></ruby>せて<ruby>魚<rt>さかな</rt></ruby>を<ruby>獲<rt>え</rt></ruby>る<ruby>道具<rt>どうぐ</rt></ruby>\n②<ruby>海底<rt>かいてい</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>る<ruby>道具<rt>どうぐ</rt></ruby>\n③キレイな<ruby>海水<rt>かいすい</rt></ruby>を<ruby>運<rt>はこ</rt></ruby>ぶ<ruby>道具<rt>どうぐ</rt></ruby>',
    '正解は②の「海底を掘る道具」でした。':
      '<ruby>正解<rt>せいかい</rt></ruby>は②の「<ruby>海底<rt>かいてい</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>る<ruby>道具<rt>どうぐ</rt></ruby>」でした。',
    '海底に積もった土砂を掘って船が安全に行き来できるようにしたり、港の整備を進めたりするんだよ。':
      '<ruby>海底<rt>かいてい</rt></ruby>に<ruby>積<rt>つ</rt></ruby>もった<ruby>土<rt>つち</rt></ruby><ruby>砂<rt>すな</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>って<ruby>船<rt>ふね</rt></ruby>が<ruby>安全<rt>あんぜん</rt></ruby>に<ruby>行<rt>い</rt></ruby>き<ruby>来<rt>き</rt></ruby>できるようにしたり、<ruby>港<rt>みなと</rt></ruby>の<ruby>整備<rt>せいび</rt></ruby>を<ruby>進<rt>すす</rt></ruby>めたりするんだよ。',
    'なぞなぞだよ。つぎのうち、鳥のお友達がいないのは何番かな？':
      'なぞなぞだよ。つぎのうち、<ruby>鳥<rt>とり</rt></ruby>のお<ruby>友達<rt>ともだち</rt></ruby>がいないのは<ruby>何番<rt>なんばん</rt></ruby>かな？',
    '①サンマ\n②イワシ\n③ワカサギ': '①サンマ\n②イワシ\n③ワカサギ',
    '正解は①サンマだよ。': '<ruby>正解<rt>せいかい</rt></ruby>は①サンマだよ。',
    '②のイワシには鳥の「ワシ」が、③のワカサギには鳥の「サギ」がかくれているよ。':
      '②のイワシには<ruby>鳥<rt>とり</rt></ruby>の「ワシ」が、③のワカサギには<ruby>鳥<rt>とり</rt></ruby>の「サギ」がかくれているよ。',
    'ヒトデの仲間はどれかな？':
      'ヒトデの<ruby>仲間<rt>なかま</rt></ruby>はどれかな？',
    '①カレイ\n②ウニ\n③タコ': '①カレイ\n②ウニ\n③タコ',
    '正解は②のウニだよ。': '<ruby>正解<rt>せいかい</rt></ruby>は②のウニだよ。',
    'ウニはヒトデと同じ棘皮動物というグループの仲間なんだ。見た目は違うけど、カラダに同じ特徴があるんだって。':
      'ウニはヒトデと<ruby>同<rt>おな</rt></ruby>じ<ruby>棘皮<rt>きょくひ</rt></ruby><ruby>動物<rt>どうぶつ</rt></ruby>というグループの<ruby>仲間<rt>なかま</rt></ruby>なんだ。<ruby>見<rt>み</rt></ruby>た<ruby>目<rt>め</rt></ruby>は<ruby>違<rt>ちが</rt></ruby>うけど、カラダに<ruby>同<rt>おな</rt></ruby>じ<ruby>特徴<rt>とくちょう</rt></ruby>があるんだって。',
    'サンゴは動物？植物？':
      'サンゴは<ruby>動物<rt>どうぶつ</rt></ruby>？<ruby>植物<rt>しょくぶつ</rt></ruby>？',
    '①動物\n②植物':
      '①<ruby>動物<rt>どうぶつ</rt></ruby>\n②<ruby>植物<rt>しょくぶつ</rt></ruby>',
    '正解は①の動物':
      '<ruby>正解<rt>せいかい</rt></ruby>は①の<ruby>動物<rt>どうぶつ</rt></ruby>',
    'サンゴの体の中には褐虫藻という藻類が共生しているんだ。この藻類が作った栄養をサンゴはもらって成長するんだよ。':
      'サンゴの<ruby>体<rt>からだ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>には<ruby>褐虫藻<rt>かっちゅうそう</rt></ruby>という<ruby>藻類<rt>そうるい</rt></ruby>が<ruby>共生<rt>きょうせい</rt></ruby>しているんだ。この<ruby>藻類<rt>そうるい</rt></ruby>が<ruby>作<rt>つく</rt></ruby>った<ruby>栄養<rt>えいよう</rt></ruby>をサンゴはもらって<ruby>成長<rt>せいちょう</rt></ruby>するんだよ。',
    '①空港や港をつくる\n②ビルなどの建物をつくる\n③道路やトンネルをつくる\n④橋をかける\n⑤ダムをつくる\n⑥堤防(ていぼう)をつくる':
      '①<ruby>空港<rt>くうこう</rt></ruby>や<ruby>港<rt>みなと</rt></ruby>をつくる\n②ビルなどの<ruby>建物<rt>たてもの</rt></ruby>をつくる\n③<ruby>道路<rt>どうろ</rt></ruby>やトンネルをつくる\n④<ruby>橋<rt>ばし</rt></ruby>をかける\n⑤ダムをつくる\n⑥<ruby>堤防<rt>ていぼう</rt></ruby>(ていぼう)をつくる',
    '１、２，３，４，５，６': '１、２，３，４，５，６',
    '正解は①～⑥全部だよ。':
      '<ruby>正解<rt>せいかい</rt></ruby>は①～⑥<ruby>全部<rt>ぜんぶ</rt></ruby>だよ。',
    '建設業って、いろいろなものをつくっているんだ。みんなの暮らしにどこかでつながっているよ。':
      '<ruby>建設<rt>けんせつ</rt></ruby><ruby>業<rt>ぎょう</rt></ruby>って、いろいろなものをつくっているんだ。みんなの<ruby>暮<rt>く</rt></ruby>らしにどこかでつながっているよ。',
    '①約38万平方キロメートル（領海を含ふくむ）\n②約447万平方キロメートル（領海を含ふくむ）\n③約762万平方キロメートル（領海を含ふくむ）':
      '①<ruby>約<rt>やく</rt></ruby>38<ruby>万<rt>まん</rt></ruby><ruby>平方<rt>へいほう</rt></ruby>キロメートル（<ruby>領海<rt>りょうかい</rt></ruby>を<ruby>含<rt>ふくみ</rt></ruby>ふくむ）\n②<ruby>約<rt>やく</rt></ruby>447<ruby>万<rt>まん</rt></ruby><ruby>平方<rt>へいほう</rt></ruby>キロメートル（<ruby>領海<rt>りょうかい</rt></ruby>を<ruby>含<rt>ふくみ</rt></ruby>ふくむ）\n③<ruby>約<rt>やく</rt></ruby>762<ruby>万<rt>まん</rt></ruby><ruby>平方<rt>へいほう</rt></ruby>キロメートル（<ruby>領海<rt>りょうかい</rt></ruby>を<ruby>含<rt>ふくみ</rt></ruby>ふくむ）',
    'こんどは、漢字の問題だよ。魚の「アジ」を表しているのはどの漢字かな？':
      'こんどは、<ruby>漢字<rt>かんじ</rt></ruby>の<ruby>問題<rt>もんだい</rt></ruby>だよ。<ruby>魚<rt>さかな</rt></ruby>の「アジ」を<ruby>表<rt>あらわ</rt></ruby>しているのはどの<ruby>漢字<rt>かんじ</rt></ruby>かな？',
    '①鯖\n②鰆\n③鯵':
      '①<ruby>鯖<rt>さば</rt></ruby>\n②<ruby>鰆<rt>さわら</rt></ruby>\n③<ruby>鯵<rt>あじ</rt></ruby>',
    '正解は③の鯵だよ。':
      '<ruby>正解<rt>せいかい</rt></ruby>は③の<ruby>鯵<rt>あじ</rt></ruby>だよ。',
    'ちなみに①はサバ、②はサワラだよ。': 'ちなみに①はサバ、②はサワラだよ。',
    '①渦を起こして魚をおびき寄せて魚の群れを獲る道具\n②海底を掘る道具\n③海洋深層水を運ぶ道具':
      '①<ruby>渦<rt>うず</rt></ruby>を<ruby>起<rt>お</rt></ruby>こして<ruby>魚<rt>さかな</rt></ruby>をおびき<ruby>寄<rt>よ</rt></ruby>せて<ruby>魚<rt>さかな</rt></ruby>の<ruby>群<rt>む</rt></ruby>れを<ruby>獲<rt>え</rt></ruby>る<ruby>道具<rt>どうぐ</rt></ruby>\n②<ruby>海底<rt>かいてい</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>る<ruby>道具<rt>どうぐ</rt></ruby>\n③<ruby>海洋<rt>かいよう</rt></ruby><ruby>深層<rt>しんそう</rt></ruby><ruby>水<rt>みず</rt></ruby>を<ruby>運<rt>はこ</rt></ruby>ぶ<ruby>道具<rt>どうぐ</rt></ruby>',
    '海底に堆積した土砂を掘って船が安全に行き来できるようにしたり、港の整備を進めたりするんだよ。':
      '<ruby>海底<rt>かいてい</rt></ruby>に<ruby>堆積<rt>たいせき</rt></ruby>した<ruby>土<rt>つち</rt></ruby><ruby>砂<rt>すな</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>って<ruby>船<rt>ふね</rt></ruby>が<ruby>安全<rt>あんぜん</rt></ruby>に<ruby>行<rt>い</rt></ruby>き<ruby>来<rt>き</rt></ruby>できるようにしたり、<ruby>港<rt>みなと</rt></ruby>の<ruby>整備<rt>せいび</rt></ruby>を<ruby>進<rt>すす</rt></ruby>めたりするんだよ。',
    '海の中にいるのは、次のどれかな？':
      '<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にいるのは、<ruby>次<rt>つぎ</rt></ruby>のどれかな？',
    '正解は①の「たつ」だよ。':
      '<ruby>正解<rt>せいかい</rt></ruby>は①の「たつ」だよ。',
    '十二支って知ってるかな？「ね、うし、とら、う、たつ、み、うま、ひつじ、さる、とり、いぬ、い」':
      '<ruby>十二支<rt>じゅうにし</rt></ruby>って<ruby>知<rt>し</rt></ruby>ってるかな？「ね、うし、とら、う、たつ、み、うま、ひつじ、さる、とり、いぬ、い」',
    '風のエネルギーを電気のエネルギーに変える風力発電って聞いたことある？海に囲まれている日本では、海の上に風車を設置する「洋上風力発電」が注目されているんだ。さて、１９９０年代に世界初の洋上風力発電を設置したのはどこの国かな？':
      '<ruby>風<rt>かぜ</rt></ruby>のエネルギーを<ruby>電気<rt>でんき</rt></ruby>のエネルギーに<ruby>変<rt>か</rt></ruby>える<ruby>風力<rt>ふうりょく</rt></ruby><ruby>発電<rt>はつでん</rt></ruby>って<ruby>聞<rt>き</rt></ruby>いたことある？<ruby>海<rt>うみ</rt></ruby>に<ruby>囲<rt>かこ</rt></ruby>まれている<ruby>日本<rt>にほん</rt></ruby>では、<ruby>海<rt>うみ</rt></ruby>の<ruby>上<rt>うえ</rt></ruby>に<ruby>風車<rt>かざぐるま</rt></ruby>を<ruby>設置<rt>せっち</rt></ruby>する「<ruby>洋上<rt>ようじょう</rt></ruby><ruby>風力<rt>ふうりょく</rt></ruby><ruby>発電<rt>はつでん</rt></ruby>」が<ruby>注目<rt>ちゅうもく</rt></ruby>されているんだ。さて、１９９０<ruby>年代<rt>ねんだい</rt></ruby>に<ruby>世界<rt>せかい</rt></ruby><ruby>初<rt>はつ</rt></ruby>の<ruby>洋上<rt>ようじょう</rt></ruby><ruby>風力<rt>ふうりょく</rt></ruby><ruby>発電<rt>はつでん</rt></ruby>を<ruby>設置<rt>せっち</rt></ruby>したのはどこの<ruby>国<rt>くに</rt></ruby>かな？',
    '①デンマーク\n②イギリス\n③ドイツ': '①デンマーク\n②イギリス\n③ドイツ',
    '正解は①のデンマーク！':
      '<ruby>正解<rt>せいかい</rt></ruby>は①のデンマーク！',
    'デンマークは1970年代の石油ショック等を契機に、温室効果ガスを排出しない再生可能エネルギーへの転換を積極的に進めてきたんだ。':
      'デンマークは1970<ruby>年代<rt>ねんだい</rt></ruby>の<ruby>石油<rt>せきゆ</rt></ruby>ショック<ruby>等<rt>など</rt></ruby>を<ruby>契機<rt>けいき</rt></ruby>に、<ruby>温室<rt>おんしつ</rt></ruby><ruby>効果<rt>こうか</rt></ruby>ガスを<ruby>排出<rt>はいしゅつ</rt></ruby>しない<ruby>再生<rt>さいせい</rt></ruby><ruby>可能<rt>かのう</rt></ruby>エネルギーへの<ruby>転換<rt>てんかん</rt></ruby>を<ruby>積極的<rt>せっきょくてき</rt></ruby>に<ruby>進<rt>すす</rt></ruby>めてきたんだ。',
    '次のうち海の比較的浅いところで育つアマモ（海草）は何番かな？':
      '<ruby>次<rt>つぎ</rt></ruby>のうち<ruby>海<rt>うみ</rt></ruby>の<ruby>比較的<rt>ひかくてき</rt></ruby><ruby>浅<rt>あさ</rt></ruby>いところで<ruby>育<rt>そだ</rt></ruby>つアマモ（<ruby>海草<rt>かいそう</rt></ruby>）は<ruby>何番<rt>なんばん</rt></ruby>かな？',
    'アマモは産卵場所になったり、小さな動物の隠れる場所になったり、餌をとる場所になるなど、さまざまな生物な生活を支えているんだね。':
      'アマモは<ruby>産卵<rt>さんらん</rt></ruby><ruby>場所<rt>ばしょ</rt></ruby>になったり、<ruby>小<rt>ちい</rt></ruby>さな<ruby>動物<rt>どうぶつ</rt></ruby>の<ruby>隠<rt>かく</rt></ruby>れる<ruby>場所<rt>ばしょ</rt></ruby>になったり、<ruby>餌<rt>えさ</rt></ruby>をとる<ruby>場所<rt>ばしょ</rt></ruby>になるなど、さまざまな<ruby>生物<rt>せいぶつ</rt></ruby>な<ruby>生活<rt>せいかつ</rt></ruby>を<ruby>支<rt>ささ</rt></ruby>えているんだね。',
    '①海の中を自由に泳ぐことができる。\n②海の中で石を運んで並べたり、ならすことができる。\n③海の中でくるくる回って発電することができる。':
      '①<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>を<ruby>自由<rt>じゆう</rt></ruby>に<ruby>泳<rt>およ</rt></ruby>ぐことができる。\n②<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>で<ruby>石<rt>いし</rt></ruby>を<ruby>運<rt>はこ</rt></ruby>んで<ruby>並<rt>なら</rt></ruby>べたり、ならすことができる。\n③<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>でくるくる<ruby>回<rt>まわ</rt></ruby>って<ruby>発電<rt>はつでん</rt></ruby>することができる。',
    '港を造るとき、水の中ではこんな機械が活躍しているんだ。人が乗らずに遠くから操作して、動かすこともできるんだよ。写真の水中バックホウは模型で、みんなにも操作を体験してもらえるよ。':
      '<ruby>港<rt>みなと</rt></ruby>を<ruby>造<rt>つく</rt></ruby>るとき、<ruby>水<rt>みず</rt></ruby>の<ruby>中<rt>なか</rt></ruby>ではこんな<ruby>機械<rt>きかい</rt></ruby>が<ruby>活躍<rt>かつやく</rt></ruby>しているんだ。<ruby>人<rt>ひと</rt></ruby>が<ruby>乗<rt>の</rt></ruby>らずに<ruby>遠<rt>とお</rt></ruby>くから<ruby>操作<rt>そうさ</rt></ruby>して、<ruby>動<rt>うご</rt></ruby>かすこともできるんだよ。<ruby>写真<rt>しゃしん</rt></ruby>の<ruby>水中<rt>すいちゅう</rt></ruby>バックホウは<ruby>模型<rt>もけい</rt></ruby>で、みんなにも<ruby>操作<rt>そうさ</rt></ruby>を<ruby>体験<rt>たいけん</rt></ruby>してもらえるよ。',
    'イソギンチャクは魚などを刺して毒でしびれさせて餌にするけど、カクレクマノミは刺されないんだって。どうしてかな？':
      'イソギンチャクは<ruby>魚<rt>さかな</rt></ruby>などを<ruby>刺<rt>さ</rt></ruby>して<ruby>毒<rt>どく</rt></ruby>でしびれさせて<ruby>餌<rt>えさ</rt></ruby>にするけど、カクレクマノミは<ruby>刺<rt>さ</rt></ruby>されないんだって。どうしてかな？',
    '①カクレクマノミが刺される前に素早く逃げることができるから。\n②イソギンチャクが、カクレクマノミの毒針を恐れているから。\n③カクレクマノミの体が特別な粘液で覆われているから。':
      '①カクレクマノミが<ruby>刺<rt>さ</rt></ruby>される<ruby>前<rt>まえ</rt></ruby>に<ruby>素早<rt>すばや</rt></ruby>く<ruby>逃<rt>に</rt></ruby>げることができるから。\n②イソギンチャクが、カクレクマノミの<ruby>毒針<rt>どくばり</rt></ruby>を<ruby>恐<rt>おそ</rt></ruby>れているから。\n③カクレクマノミの<ruby>体<rt>からだ</rt></ruby>が<ruby>特別<rt>とくべつ</rt></ruby>な<ruby>粘液<rt>ねんえき</rt></ruby>で<ruby>覆<rt>おお</rt></ruby>われているから。',
    'カクレクマノミは特別な粘液で体が覆われているために、刺されないんだって。カクレクマノミの餌の一部をイソギンチャクがもらうこともあるんだって。':
      'カクレクマノミは<ruby>特別<rt>とくべつ</rt></ruby>な<ruby>粘液<rt>ねんえき</rt></ruby>で<ruby>体<rt>からだ</rt></ruby>が<ruby>覆<rt>おお</rt></ruby>われているために、<ruby>刺<rt>さ</rt></ruby>されないんだって。カクレクマノミの<ruby>餌<rt>えさ</rt></ruby>の<ruby>一部<rt>いちぶ</rt></ruby>をイソギンチャクがもらうこともあるんだって。',
    '１，２，３，４，５，６': '１，２，３，４，５，６',
    '外来種って知ってる？もともとその地域にいなかったのに、人間の活動によって他の地域から入ってきた生物のことなんだ。\nさて、写真の外来種の貝の名前はなんだと思う？':
      '<ruby>外来種<rt>がいらいしゅ</rt></ruby>って<ruby>知<rt>し</rt></ruby>ってる？もともとその<ruby>地域<rt>ちいき</rt></ruby>にいなかったのに、<ruby>人間<rt>にんげん</rt></ruby>の<ruby>活動<rt>かつどう</rt></ruby>によって<ruby>他<rt>ほか</rt></ruby>の<ruby>地域<rt>ちいき</rt></ruby>から<ruby>入<rt>はい</rt></ruby>ってきた<ruby>生物<rt>せいぶつ</rt></ruby>のことなんだ。\nさて、<ruby>写真<rt>しゃしん</rt></ruby>の<ruby>外来種<rt>がいらいしゅ</rt></ruby>の<ruby>貝<rt>かい</rt></ruby>の<ruby>名前<rt>なまえ</rt></ruby>はなんだと<ruby>思<rt>おも</rt></ruby>う？',
    '①ムラサキイガイ\n②ムラサキヒバリ\n③ムラサキグリ':
      '①ムラサキイガイ\n②ムラサキヒバリ\n③ムラサキグリ',
    '正解は①のムラサキイガイだよ。':
      '<ruby>正解<rt>せいかい</rt></ruby>は①のムラサキイガイだよ。',
    '海岸に行くとブロックや護岸によく付いているから、今度見てみてね。\n外来種はもともとそこに生活していた生物から生活の場や餌を奪って、大繁殖することがあるんだ。':
      '<ruby>海岸<rt>かいがん</rt></ruby>に<ruby>行<rt>い</rt></ruby>くとブロックや<ruby>護岸<rt>ごがん</rt></ruby>によく<ruby>付<rt>つ</rt></ruby>いているから、<ruby>今度<rt>こんど</rt></ruby><ruby>見<rt>み</rt></ruby>てみてね。\n<ruby>外来種<rt>がいらいしゅ</rt></ruby>はもともとそこに<ruby>生活<rt>せいかつ</rt></ruby>していた<ruby>生物<rt>せいぶつ</rt></ruby>から<ruby>生活<rt>せいかつ</rt></ruby>の<ruby>場<rt>ば</rt></ruby>や<ruby>餌<rt>えさ</rt></ruby>を<ruby>奪<rt>うば</rt></ruby>って、<ruby>大<rt>だい</rt></ruby><ruby>繁殖<rt>はんしょく</rt></ruby>することがあるんだ。',
    'ウニの仲間は次のうちどれかな？':
      'ウニの<ruby>仲間<rt>なかま</rt></ruby>は<ruby>次<rt>つぎ</rt></ruby>のうちどれかな？',
    '①ヒトデ\n②サンマ\n③アサリ': '①ヒトデ\n②サンマ\n③アサリ',
    '正解は①のヒトデだよ。':
      '<ruby>正解<rt>せいかい</rt></ruby>は①のヒトデだよ。',
    'ウニやヒトデは棘皮動物といわれるんだ。見た目は違うけど、カラダに同じ特徴があるんだって。':
      'ウニやヒトデは<ruby>棘皮<rt>きょくひ</rt></ruby><ruby>動物<rt>どうぶつ</rt></ruby>といわれるんだ。<ruby>見<rt>み</rt></ruby>た<ruby>目<rt>め</rt></ruby>は<ruby>違<rt>ちが</rt></ruby>うけど、カラダに<ruby>同<rt>おな</rt></ruby>じ<ruby>特徴<rt>とくちょう</rt></ruby>があるんだって。',
    'サンゴ礁にはたくさんの生き物がやってくるよ。その理由でまちがっているのはどれかな？':
      '<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>にはたくさんの<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>がやってくるよ。その<ruby>理由<rt>りゆう</rt></ruby>でまちがっているのはどれかな？',
    '①エサがあるから\n②隠れる場所があるから\n③サンゴ礁が魚たちを乗せて水中を移動するから。':
      '①エサがあるから\n②<ruby>隠<rt>かく</rt></ruby>れる<ruby>場所<rt>ばしょ</rt></ruby>があるから\n③<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>が<ruby>魚<rt>さかな</rt></ruby>たちを<ruby>乗<rt>の</rt></ruby>せて<ruby>水中<rt>すいちゅう</rt></ruby>を<ruby>移動<rt>いどう</rt></ruby>するから。',
    '正解は③　サンゴ礁は動かないので③が間違いだね。':
      '<ruby>正解<rt>せいかい</rt></ruby>は③　<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>は<ruby>動<rt>うご</rt></ruby>かないので③が<ruby>間違<rt>まちが</rt></ruby>いだね。',
    'サンゴ礁にはたくさんの生き物が餌を食べにくるよ。':
      '<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>にはたくさんの<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>餌<rt>えさ</rt></ruby>を<ruby>食<rt>た</rt></ruby>べにくるよ。',
    '建設業ってどんな仕事をしているか知っているかな？\n次のうち当てはまると思う仕事を<span>全部</span>選んでね。':
      '<ruby>建設<rt>けんせつ</rt></ruby><ruby>業<rt>ぎょう</rt></ruby>ってどんな<ruby>仕事<rt>しごと</rt></ruby>をしているか<ruby>知<rt>し</rt></ruby>っているかな？\n<ruby>次<rt>つぎ</rt></ruby>のうち<ruby>当<rt>あ</rt></ruby>てはまると<ruby>思<rt>おも</rt></ruby>う<ruby>仕事<rt>しごと</rt></ruby>を<span><ruby>全部<rt>ぜんぶ</rt></ruby></span><ruby>選<rt>えら</rt></ruby>んでね。',
    '②のイ<span>ワシ</span>には鳥の「ワシ」が、③のワカ<span>サギ</span>には鳥の「サギ」がかくれているよ。':
      '②のイ<span>ワシ</span>には<ruby>鳥<rt>とり</rt></ruby>の「ワシ」が、③のワカ<span>サギ</span>には<ruby>鳥<rt>とり</rt></ruby>の「サギ」がかくれているよ。',
    'アマモは産卵場所になったり、小さな動物の隠れる場所になったり、餌をとる場所になるなど、さまざまな生物の生活を支えているんだね。':
      'アマモは<ruby>産卵<rt>さんらん</rt></ruby><ruby>場所<rt>ばしょ</rt></ruby>になったり、<ruby>小<rt>ちい</rt></ruby>さな<ruby>動物<rt>どうぶつ</rt></ruby>の<ruby>隠<rt>かく</rt></ruby>れる<ruby>場所<rt>ばしょ</rt></ruby>になったり、<ruby>餌<rt>えさ</rt></ruby>をとる<ruby>場所<rt>ばしょ</rt></ruby>になるなど、さまざまな<ruby>生物<rt>せいぶつ</rt></ruby>の<ruby>生活<rt>せいかつ</rt></ruby>を<ruby>支<rt>ささ</rt></ruby>えているんだね。',
    '①空港や港をつくる_x000D_\n②ビルなどの建物をつくる_x000D_\n③道路やトンネルをつくる_x000D_\n④橋をかける_x000D_\n⑤ダムをつくる_x000D_\n⑥堤防をつくる':
      '①<ruby>空港<rt>くうこう</rt></ruby>や<ruby>港<rt>みなと</rt></ruby>をつくる_x000D_\n②ビルなどの<ruby>建物<rt>たてもの</rt></ruby>をつくる_x000D_\n③<ruby>道路<rt>どうろ</rt></ruby>やトンネルをつくる_x000D_\n④<ruby>橋<rt>ばし</rt></ruby>をかける_x000D_\n⑤ダムをつくる_x000D_\n⑥<ruby>堤防<rt>ていぼう</rt></ruby>をつくる',
    'マグロは自分よりも小さなイワシなどを食べるんだね。イワシは動物プランクトンを食べ、動物プランクトンは植物プランクトンを食べるんだ。みんなの口にマグロが届くまでに、海の中では食べたり、食べられたりを何回くり返すのかな。　':
      'マグロは<ruby>自分<rt>じぶん</rt></ruby>よりも<ruby>小<rt>ちい</rt></ruby>さなイワシなどを<ruby>食<rt>た</rt></ruby>べるんだね。イワシは<ruby>動物<rt>どうぶつ</rt></ruby>プランクトンを<ruby>食<rt>た</rt></ruby>べ、<ruby>動物<rt>どうぶつ</rt></ruby>プランクトンは<ruby>植物<rt>しょくぶつ</rt></ruby>プランクトンを<ruby>食<rt>た</rt></ruby>べるんだ。みんなの<ruby>口<rt>くち</rt></ruby>にマグロが<ruby>届<rt>とど</rt></ruby>くまでに、<ruby>海<rt>うみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>では<ruby>食<rt>た</rt></ruby>べたり、<ruby>食<rt>た</rt></ruby>べられたりを<ruby>何回<rt>なんかい</rt></ruby>くり<ruby>返<rt>かえ</rt></ruby>すのかな。　',
    'ヒトデには貝を食べたり、サンゴを食べる仲間もいるよ。ヒトデ類の多くは、胃袋を口から出して餌を覆って、消化液を出して溶かして吸収するんだって。':
      'ヒトデには<ruby>貝<rt>かい</rt></ruby>を<ruby>食<rt>た</rt></ruby>べたり、サンゴを<ruby>食<rt>た</rt></ruby>べる<ruby>仲間<rt>なかま</rt></ruby>もいるよ。ヒトデ<ruby>類<rt>るい</rt></ruby>の<ruby>多<rt>おお</rt></ruby>くは、<ruby>胃袋<rt>いぶくろ</rt></ruby>を<ruby>口<rt>くち</rt></ruby>から<ruby>出<rt>だ</rt></ruby>して<ruby>餌<rt>えさ</rt></ruby>を<ruby>覆<rt>おお</rt></ruby>って、<ruby>消化液<rt>しょうかえき</rt></ruby>を<ruby>出<rt>だ</rt></ruby>して<ruby>溶<rt>と</rt></ruby>かして<ruby>吸収<rt>きゅうしゅう</rt></ruby>するんだって。',
    '正解は③　サンゴは動物だけど遠くへ移動しないから③が間違いだね。':
      '<ruby>正解<rt>せいかい</rt></ruby>は③　サンゴは<ruby>動物<rt>どうぶつ</rt></ruby>だけど<ruby>遠<rt>とお</rt></ruby>くへ<ruby>移動<rt>いどう</rt></ruby>しないから③が<ruby>間違<rt>まちが</rt></ruby>いだね。',
    'イカの吸盤の内側は、ギザギザになっていて餌を<span>捕まえやすく</span>なっているんだ。\n生き物のカラダには、いろいろな工夫があって、面白いね。':
      'イカの<ruby>吸盤<rt>きゅうばん</rt></ruby>の<ruby>内側<rt>うちがわ</rt></ruby>は、ギザギザになっていて<ruby>餌<rt>えさ</rt></ruby>を<span><ruby>捕<rt>つか</rt></ruby>まえやすく</span>なっているんだ。\n<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>のカラダには、いろいろな<ruby>工夫<rt>くふう</rt></ruby>があって、<ruby>面白<rt>おもしろ</rt></ruby>いね。',
    'イカの吸盤の内側は、ギザギザになっていて餌を<red>捕まえやすく</red>なっているんだ。\n生き物のカラダには、いろいろな工夫があって、面白いね。':
      'イカの<ruby>吸盤<rt>きゅうばん</rt></ruby>の<ruby>内側<rt>うちがわ</rt></ruby>は、ギザギザになっていて<ruby>餌<rt>えさ</rt></ruby>を<red><ruby>捕<rt>つか</rt></ruby>まえやすく</red>なっているんだ。\n<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>のカラダには、いろいろな<ruby>工夫<rt>くふう</rt></ruby>があって、<ruby>面白<rt>おもしろ</rt></ruby>いね。',
    '②のイ<red>ワシ</red>には鳥の「ワシ」が、③のワカ<red>サギ</red>には鳥の「サギ」がかくれているよ。':
      '②のイ<red>ワシ</red>には<ruby>鳥<rt>とり</rt></ruby>の「ワシ」が、③のワカ<red>サギ</red>には<ruby>鳥<rt>とり</rt></ruby>の「サギ」がかくれているよ。',
    '建設業ってどんな仕事をしているか知っているかな？\n次のうち当てはまると思う仕事を<red>全部</red>選んでね。':
      '<ruby>建設<rt>けんせつ</rt></ruby><ruby>業<rt>ぎょう</rt></ruby>ってどんな<ruby>仕事<rt>しごと</rt></ruby>をしているか<ruby>知<rt>し</rt></ruby>っているかな？\n<ruby>次<rt>つぎ</rt></ruby>のうち<ruby>当<rt>あ</rt></ruby>てはまると<ruby>思<rt>おも</rt></ruby>う<ruby>仕事<rt>しごと</rt></ruby>を<red><ruby>全部<rt>ぜんぶ</rt></ruby></red><ruby>選<rt>えら</rt></ruby>んでね。',
    'イカの吸盤の内側は、ギザギザになっていて餌を<span style="color: red;">捕まえやすく</spanなっているんだ。\n生き物のカラダには、いろいろな工夫があって、面白いね。':
      'イカの<ruby>吸盤<rt>きゅうばん</rt></ruby>の<ruby>内側<rt>うちがわ</rt></ruby>は、ギザギザになっていて<ruby>餌<rt>えさ</rt></ruby>を<span style="color: red;"><ruby>捕<rt>つか</rt></ruby>まえやすく</spanなっているんだ。\n<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>のカラダには、いろいろな<ruby>工夫<rt>くふう</rt></ruby>があって、<ruby>面白<rt>おもしろ</rt></ruby>いね。',
    '②のイ<span style="color: red;">ワシ</spanには鳥の「ワシ」が、③のワカ<span style="color: red;">サギ</spanには鳥の「サギ」がかくれているよ。':
      '②のイ<span style="color: red;">ワシ</spanには<ruby>鳥<rt>とり</rt></ruby>の「ワシ」が、③のワカ<span style="color: red;">サギ</spanには<ruby>鳥<rt>とり</rt></ruby>の「サギ」がかくれているよ。',
    '建設業ってどんな仕事をしているか知っているかな？\n次のうち当てはまると思う仕事を<span style="color: red;">全部</span選んでね。':
      '<ruby>建設<rt>けんせつ</rt></ruby><ruby>業<rt>ぎょう</rt></ruby>ってどんな<ruby>仕事<rt>しごと</rt></ruby>をしているか<ruby>知<rt>し</rt></ruby>っているかな？\n<ruby>次<rt>つぎ</rt></ruby>のうち<ruby>当<rt>あ</rt></ruby>てはまると<ruby>思<rt>おも</rt></ruby>う<ruby>仕事<rt>しごと</rt></ruby>を<span style="color: red;"><ruby>全部<rt>ぜんぶ</rt></ruby></span<ruby>選<rt>えら</rt></ruby>んでね。',
    'イカの吸盤の内側は、ギザギザになっていて餌を<span style="color: red;">捕まえやすく</span>なっているんだ。\n生き物のカラダには、いろいろな工夫があって、面白いね。':
      'イカの<ruby>吸盤<rt>きゅうばん</rt></ruby>の<ruby>内側<rt>うちがわ</rt></ruby>は、ギザギザになっていて<ruby>餌<rt>えさ</rt></ruby>を<span style="color: red;"><ruby>捕<rt>つか</rt></ruby>まえやすく</span>なっているんだ。\n<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>のカラダには、いろいろな<ruby>工夫<rt>くふう</rt></ruby>があって、<ruby>面白<rt>おもしろ</rt></ruby>いね。',
    '②のイ<span style="color: red;">ワシ</span>には鳥の「ワシ」が、③のワカ<span style="color: red;">サギ</span>には鳥の「サギ」がかくれているよ。':
      '②のイ<span style="color: red;">ワシ</span>には<ruby>鳥<rt>とり</rt></ruby>の「ワシ」が、③のワカ<span style="color: red;">サギ</span>には<ruby>鳥<rt>とり</rt></ruby>の「サギ」がかくれているよ。',
    '建設業ってどんな仕事をしているか知っているかな？\n次のうち当てはまると思う仕事を<span style="color: red;">全部</span>選んでね。':
      '<ruby>建設<rt>けんせつ</rt></ruby><ruby>業<rt>ぎょう</rt></ruby>ってどんな<ruby>仕事<rt>しごと</rt></ruby>をしているか<ruby>知<rt>し</rt></ruby>っているかな？\n<ruby>次<rt>つぎ</rt></ruby>のうち<ruby>当<rt>あ</rt></ruby>てはまると<ruby>思<rt>おも</rt></ruby>う<ruby>仕事<rt>しごと</rt></ruby>を<span style="color: red;"><ruby>全部<rt>ぜんぶ</rt></ruby></span><ruby>選<rt>えら</rt></ruby>んでね。',
    '海って聞くと、ぼくは食いしん坊だからすぐに魚や貝を思い<span>浮かべちゃうんだ。</span>\n　いま、日本人がよく食べている魚の1位はサケで、2位がマグロなんだって。下の絵の中で、どれがマグロかわかるかな。正しいのは何番？':
      '<ruby>海<rt>うみ</rt></ruby>って<ruby>聞<rt>き</rt></ruby>くと、ぼくは<ruby>食<rt>た</rt></ruby>いしん<ruby>坊<rt>ぼう</rt></ruby>だからすぐに<ruby>魚<rt>さかな</rt></ruby>や<ruby>貝<rt>かい</rt></ruby>を<ruby>思<rt>おも</rt></ruby>い<span><ruby>浮<rt>う</rt></ruby>かべちゃうんだ。</span>\n　いま、<ruby>日本<rt>にほん</rt></ruby><ruby>人<rt>ひと</rt></ruby>がよく<ruby>食<rt>た</rt></ruby>べている<ruby>魚<rt>さかな</rt></ruby>の1<ruby>位<rt>い</rt></ruby>はサケで、2<ruby>位<rt>い</rt></ruby>がマグロなんだって。<ruby>下<rt>した</rt></ruby>の<ruby>絵<rt>え</rt></ruby>の<ruby>中<rt>なか</rt></ruby>で、どれがマグロかわかるかな。<ruby>正<rt>ただ</rt></ruby>しいのは<ruby>何番<rt>なんばん</rt></ruby>？',
    '海って聞くと、ぼくは食いしん坊だからすぐに魚や貝を思い<span>浮かべ</span>ちゃうんだ。\n　いま、日本人がよく食べている魚の1位はサケで、2位がマグロなんだって。下の絵の中で、どれがマグロかわかるかな。正しいのは何番？':
      '<ruby>海<rt>うみ</rt></ruby>って<ruby>聞<rt>き</rt></ruby>くと、ぼくは<ruby>食<rt>た</rt></ruby>いしん<ruby>坊<rt>ぼう</rt></ruby>だからすぐに<ruby>魚<rt>さかな</rt></ruby>や<ruby>貝<rt>かい</rt></ruby>を<ruby>思<rt>おも</rt></ruby>い<span><ruby>浮<rt>う</rt></ruby>かべ</span>ちゃうんだ。\n　いま、<ruby>日本<rt>にほん</rt></ruby><ruby>人<rt>ひと</rt></ruby>がよく<ruby>食<rt>た</rt></ruby>べている<ruby>魚<rt>さかな</rt></ruby>の1<ruby>位<rt>い</rt></ruby>はサケで、2<ruby>位<rt>い</rt></ruby>がマグロなんだって。<ruby>下<rt>した</rt></ruby>の<ruby>絵<rt>え</rt></ruby>の<ruby>中<rt>なか</rt></ruby>で、どれがマグロかわかるかな。<ruby>正<rt>ただ</rt></ruby>しいのは<ruby>何番<rt>なんばん</rt></ruby>？',
    'イソギンチャクは魚などを刺して毒でしびれさせて餌するんだけど、カクレクマノミは特別な粘液で体が覆われているから、<span>刺され</span>ることがないんだって。':
      'イソギンチャクは<ruby>魚<rt>さかな</rt></ruby>などを<ruby>刺<rt>さ</rt></ruby>して<ruby>毒<rt>どく</rt></ruby>でしびれさせて<ruby>餌<rt>えさ</rt></ruby>するんだけど、カクレクマノミは<ruby>特別<rt>とくべつ</rt></ruby>な<ruby>粘液<rt>ねんえき</rt></ruby>で<ruby>体<rt>からだ</rt></ruby>が<ruby>覆<rt>おお</rt></ruby>われているから、<span><ruby>刺<rt>さ</rt></ruby>され</span>ることがないんだって。',
    '風のエネルギーを電気のエネルギーに変える風力発電って<span>聞いた</span>ことある？海に囲まれている日本では、海の上に風車を設置する「洋上風力発電」が注目されているんだ。さて、１９９０年代に世界初の洋上風力発電を設置したのはどこの国かな？':
      '<ruby>風<rt>かぜ</rt></ruby>のエネルギーを<ruby>電気<rt>でんき</rt></ruby>のエネルギーに<ruby>変<rt>か</rt></ruby>える<ruby>風力<rt>ふうりょく</rt></ruby><ruby>発電<rt>はつでん</rt></ruby>って<span><ruby>聞<rt>き</rt></ruby>いた</span>ことある？<ruby>海<rt>うみ</rt></ruby>に<ruby>囲<rt>かこ</rt></ruby>まれている<ruby>日本<rt>にほん</rt></ruby>では、<ruby>海<rt>うみ</rt></ruby>の<ruby>上<rt>うえ</rt></ruby>に<ruby>風車<rt>かざぐるま</rt></ruby>を<ruby>設置<rt>せっち</rt></ruby>する「<ruby>洋上<rt>ようじょう</rt></ruby><ruby>風力<rt>ふうりょく</rt></ruby><ruby>発電<rt>はつでん</rt></ruby>」が<ruby>注目<rt>ちゅうもく</rt></ruby>されているんだ。さて、１９９０<ruby>年代<rt>ねんだい</rt></ruby>に<ruby>世界<rt>せかい</rt></ruby><ruby>初<rt>はつ</rt></ruby>の<ruby>洋上<rt>ようじょう</rt></ruby><ruby>風力<rt>ふうりょく</rt></ruby><ruby>発電<rt>はつでん</rt></ruby>を<ruby>設置<rt>せっち</rt></ruby>したのはどこの<ruby>国<rt>くに</rt></ruby>かな？',
    'アマモは産卵場所になったり、小さな動物の隠れる場所になったり、餌をとる場所になるなど、さまざまな生物の生活を<span>支えて</span>いるんだね。':
      'アマモは<ruby>産卵<rt>さんらん</rt></ruby><ruby>場所<rt>ばしょ</rt></ruby>になったり、<ruby>小<rt>ちい</rt></ruby>さな<ruby>動物<rt>どうぶつ</rt></ruby>の<ruby>隠<rt>かく</rt></ruby>れる<ruby>場所<rt>ばしょ</rt></ruby>になったり、<ruby>餌<rt>えさ</rt></ruby>をとる<ruby>場所<rt>ばしょ</rt></ruby>になるなど、さまざまな<ruby>生物<rt>せいぶつ</rt></ruby>の<ruby>生活<rt>せいかつ</rt></ruby>を<span><ruby>支<rt>ささ</rt></ruby>えて</span>いるんだね。',
    'カクレクマノミは特別な粘液で体が覆われているために、刺されないんだって。カクレクマノミの餌の<span>一部を</span>イソギンチャクがもらうこともあるんだって。':
      'カクレクマノミは<ruby>特別<rt>とくべつ</rt></ruby>な<ruby>粘液<rt>ねんえき</rt></ruby>で<ruby>体<rt>からだ</rt></ruby>が<ruby>覆<rt>おお</rt></ruby>われているために、<ruby>刺<rt>さ</rt></ruby>されないんだって。カクレクマノミの<ruby>餌<rt>えさ</rt></ruby>の<span><ruby>一部<rt>いちぶ</rt></ruby>を</span>イソギンチャクがもらうこともあるんだって。',
    '海岸に行くとブロックや護岸によく付いているから、今度<span>見て</span>みてね。\n外来種はもともとそこに生活していた生物から生活の場や餌を奪って、大繁殖することがあるんだ。':
      '<ruby>海岸<rt>かいがん</rt></ruby>に<ruby>行<rt>い</rt></ruby>くとブロックや<ruby>護岸<rt>ごがん</rt></ruby>によく<ruby>付<rt>つ</rt></ruby>いているから、<ruby>今度<rt>こんど</rt></ruby><span><ruby>見<rt>み</rt></ruby>て</span>みてね。\n<ruby>外来種<rt>がいらいしゅ</rt></ruby>はもともとそこに<ruby>生活<rt>せいかつ</rt></ruby>していた<ruby>生物<rt>せいぶつ</rt></ruby>から<ruby>生活<rt>せいかつ</rt></ruby>の<ruby>場<rt>ば</rt></ruby>や<ruby>餌<rt>えさ</rt></ruby>を<ruby>奪<rt>うば</rt></ruby>って、<ruby>大<rt>だい</rt></ruby><ruby>繁殖<rt>はんしょく</rt></ruby>することがあるんだ。',
    'なぞなぞだよ。\nつぎのうち、鳥のお友達がいないのは何番かな？':
      'なぞなぞだよ。\nつぎのうち、<ruby>鳥<rt>とり</rt></ruby>のお<ruby>友達<rt>ともだち</rt></ruby>がいないのは<ruby>何番<rt>なんばん</rt></ruby>かな？',
    '十二支って知ってるかな？「ね、うし、とら、<u>う</u>、<span style="color: red;">『たつ』</span>、<u>み</u>、うま、ひつじ、さる、とり、いぬ、い」':
      '<ruby>十二支<rt>じゅうにし</rt></ruby>って<ruby>知<rt>し</rt></ruby>ってるかな？「ね、うし、とら、<u>う</u>、<span style="color: red;">『たつ』</span>、<u>み</u>、うま、ひつじ、さる、とり、いぬ、い」',
    '①たつ\n②う\n③み': '①たつ\n②う\n③み',
    '海底に積もった土砂を掘って船が安全に行き来できるようにしたり、回収した土砂を利用して新しい土地を造るよ。':
      '<ruby>海底<rt>かいてい</rt></ruby>に<ruby>積<rt>つ</rt></ruby>もった<ruby>土<rt>つち</rt></ruby><ruby>砂<rt>すな</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>って<ruby>船<rt>ふね</rt></ruby>が<ruby>安全<rt>あんぜん</rt></ruby>に<ruby>行<rt>い</rt></ruby>き<ruby>来<rt>き</rt></ruby>できるようにしたり、<ruby>回収<rt>かいしゅう</rt></ruby>した<ruby>土砂<rt>どしゃ</rt></ruby>を<ruby>利用<rt>りよう</rt></ruby>して<ruby>新<rt>あたら</rt></ruby>しい<ruby>土地<rt>とち</rt></ruby>を<ruby>造<rt>つく</rt></ruby>るよ。',
    '海底に堆積した土砂を掘って船が安全に行き来できるようにしたり、回収した土砂を利用して新しい土地を造るよ。':
      '<ruby>海底<rt>かいてい</rt></ruby>に<ruby>堆積<rt>たいせき</rt></ruby>した<ruby>土<rt>つち</rt></ruby><ruby>砂<rt>すな</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>って<ruby>船<rt>ふね</rt></ruby>が<ruby>安全<rt>あんぜん</rt></ruby>に<ruby>行<rt>い</rt></ruby>き<ruby>来<rt>き</rt></ruby>できるようにしたり、<ruby>回収<rt>かいしゅう</rt></ruby>した<ruby>土砂<rt>どしゃ</rt></ruby>を<ruby>利用<rt>りよう</rt></ruby>して<ruby>新<rt>あたら</rt></ruby>しい<ruby>土地<rt>とち</rt></ruby>を<ruby>造<rt>つく</rt></ruby>るよ。',
    '正解は②': '<ruby>正解<rt>せいかい</rt></ruby>は②',
    '正解は①イワシ': '<ruby>正解<rt>せいかい</rt></ruby>は①イワシ',
    'サンゴ礁って知ってる？サンゴ礁にはたくさんの生き物が生活しているね。どうしてかな？':
      '<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>って<ruby>知<rt>し</rt></ruby>ってる？<ruby>サンゴ<rt>さんご</rt></ruby><ruby>礁<rt>しょう</rt></ruby>にはたくさんの<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>生活<rt>せいかつ</rt></ruby>しているね。どうしてかな？',
    '①アサリ\n②シオフキ\n③マテガイ': '①アサリ\n②シオフキ\n③マテガイ',
    'イソギンチャクは魚などを刺して毒でしびれさせて餌にするんだけど、カクレクマノミは特別な粘液で体が覆われているから、<span>刺され</span>ることがないんだって。':
      'イソギンチャクは<ruby>魚<rt>さかな</rt></ruby>などを<ruby>刺<rt>さ</rt></ruby>して<ruby>毒<rt>どく</rt></ruby>でしびれさせて<ruby>餌<rt>えさ</rt></ruby>にするんだけど、カクレクマノミは<ruby>特別<rt>とくべつ</rt></ruby>な<ruby>粘液<rt>ねんえき</rt></ruby>で<ruby>体<rt>からだ</rt></ruby>が<ruby>覆<rt>おお</rt></ruby>われているから、<span><ruby>刺<rt>さ</rt></ruby>され</span>ることがないんだって。',
    '①ツノダシ\n②フエダイの仲間\n③カクレクマノミ':
      '①ツノダシ\n②フエダイの<ruby>仲間<rt>なかま</rt></ruby>\n③カクレクマノミ',
    'サンゴの体の中には褐虫藻という藻類が共生しているんだ。サンゴはこの藻類が作った栄養をもらって成長するんだよ。':
      'サンゴの<ruby>体<rt>からだ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>には<ruby>褐虫藻<rt>かっちゅうそう</rt></ruby>という<ruby>藻類<rt>そうるい</rt></ruby>が<ruby>共生<rt>きょうせい</rt></ruby>しているんだ。サンゴはこの<ruby>藻類<rt>そうるい</rt></ruby>が<ruby>作<rt>つく</rt></ruby>った<ruby>栄養<rt>えいよう</rt></ruby>をもらって<ruby>成長<rt>せいちょう</rt></ruby>するんだよ。',
    '日本は海に囲まれているけど、漁業をしたり、石油などの天然資源を掘ったりという活動を他の国に邪魔されずに自由に行える水域（排他的経済水域）が日本にはどれくらいあると思う？正しい答えの番号を選んでね。':
      '<ruby>日本<rt>にほん</rt></ruby>は<ruby>海<rt>うみ</rt></ruby>に<ruby>囲<rt>かこ</rt></ruby>まれているけど、<ruby>漁業<rt>ぎょぎょう</rt></ruby>をしたり、<ruby>石油<rt>せきゆ</rt></ruby>などの<ruby>天然<rt>てんねん</rt></ruby><ruby>資源<rt>しげん</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>ったりという<ruby>活動<rt>かつどう</rt></ruby>を<ruby>他<rt>ほか</rt></ruby>の<ruby>国<rt>くに</rt></ruby>に<ruby>邪魔<rt>じゃま</rt></ruby>されずに<ruby>自由<rt>じゆう</rt></ruby>に<ruby>行<rt>おこな</rt></ruby>える<ruby>水域<rt>すいいき</rt></ruby>（<ruby>排他的<rt>はいたてき</rt></ruby><ruby>経済<rt>けいざい</rt></ruby><ruby>水域<rt>すいいき</rt></ruby>）が<ruby>日本<rt>にほん</rt></ruby>にはどれくらいあると<ruby>思<rt>おも</rt></ruby>う？<ruby>正<rt>ただ</rt></ruby>しい<ruby>答<rt>こた</rt></ruby>えの<ruby>番<rt>ばん</rt></ruby><ruby>号<rt>ごう</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んでね。',
    'みんなはお魚好き？ぼくは大好き。日本の近海には、約3,700種の魚が生息しているんだ。これは世界にいる約15,000種の海水魚のうちの約25％に当たるよ。\nでは、日本の海に、イルカやアザラシなど海で生活する哺乳類は何種いるでしょう。正しいと思う数字を選んでね。':
      'みんなはお<ruby>魚<rt>さかな</rt></ruby><ruby>好<rt>ず</rt></ruby>き？ぼくは<ruby>大好<rt>だいす</rt></ruby>き。<ruby>日本<rt>にほん</rt></ruby>の<ruby>近海<rt>きんかい</rt></ruby>には、<ruby>約<rt>やく</rt></ruby>3,700<ruby>種<rt>しゅ</rt></ruby>の<ruby>魚<rt>さかな</rt></ruby>が<ruby>生息<rt>せいそく</rt></ruby>しているんだ。これは<ruby>世界<rt>せかい</rt></ruby>にいる<ruby>約<rt>やく</rt></ruby>15,000<ruby>種<rt>しゅ</rt></ruby>の<ruby>海水魚<rt>かいすいぎょ</rt></ruby>のうちの<ruby>約<rt>やく</rt></ruby>25％に<ruby>当<rt>あ</rt></ruby>たるよ。\nでは、<ruby>日本<rt>にほん</rt></ruby>の<ruby>海<rt>うみ</rt></ruby>に、イルカやアザラシなど<ruby>海<rt>うみ</rt></ruby>で<ruby>生活<rt>せいかつ</rt></ruby>する<ruby>哺乳類<rt>ほにゅうるい</rt></ruby>は<ruby>何種<rt>なにしゅ</rt></ruby>いるでしょう。<ruby>正<rt>ただ</rt></ruby>しいと<ruby>思<rt>おも</rt></ruby>う<ruby>数字<rt>すうじ</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んでね。',
    '①渦を起こし、魚をおびき寄せて魚の群れを獲る道具\n②海底を掘る道具\n③海洋深層水を運ぶ道具':
      '①<ruby>渦<rt>うず</rt></ruby>を<ruby>起<rt>お</rt></ruby>こし、<ruby>魚<rt>さかな</rt></ruby>をおびき<ruby>寄<rt>よ</rt></ruby>せて<ruby>魚<rt>さかな</rt></ruby>の<ruby>群<rt>む</rt></ruby>れを<ruby>獲<rt>え</rt></ruby>る<ruby>道具<rt>どうぐ</rt></ruby>\n②<ruby>海底<rt>かいてい</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>る<ruby>道具<rt>どうぐ</rt></ruby>\n③<ruby>海洋<rt>かいよう</rt></ruby><ruby>深層<rt>しんそう</rt></ruby><ruby>水<rt>みず</rt></ruby>を<ruby>運<rt>はこ</rt></ruby>ぶ<ruby>道具<rt>どうぐ</rt></ruby>',
    '①アカモク\n②アマモ\n③ワカメのめかぶ':
      '①アカモク\n②アマモ\n③ワカメのめかぶ',
    'もうちょっと。惜しかったね！\n5問中4問正解で80点だよ\nこれからも海のこといっしょに勉強しようね。':
      'もうちょっと。<ruby>惜<rt>お</rt></ruby>しかったね！\n5<ruby>問<rt>もん</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>4<ruby>問<rt>もん</rt></ruby><ruby>正解<rt>せいかい</rt></ruby>で80<ruby>点<rt>てん</rt></ruby>だよ\nこれからも<ruby>海<rt>うみ</rt></ruby>のこといっしょに<ruby>勉強<rt>べんきょう</rt></ruby>しようね。',
    '①マダコ\n②イカ': '①マダコ\n②イカ',
    '①マダコの吸盤\n②スルメイカの吸盤':
      '①マダコの<ruby>吸盤<rt>きゅうばん</rt></ruby>\n②スルメイカの<ruby>吸盤<rt>きゅうばん</rt></ruby>',
    '①\n②': '①\n②',
    // '2': '2',
    // '1': '1',
    // '3': '3',
  }
  const result = dict[text]
  if (result) {
    return result
  } else {
    return text
  }
}

export const rubyHtmlToSpanArray = (html: string) => {
  const root = parse(html)

  return root.childNodes.map((n) => {
    if (n.childNodes.length > 0) {
      return n.childNodes.map((nn) => {
        return nn.text
      })
    }
    return [n.text, '']
  })
}

export const setFirestoreFromSheetOld = async () => {
  const datas = await getQuizDatasFromSheetOld()

  const db = getFirestore()

  // const bat = db.batch()

  for (const qd of datas) {
    const docref = db.doc(`QuizDatas/${qd.id}`)
    const ret = await docref.set(qd)
    // bat.set(docref, qd)
    console.log(`id=${qd.id} done.`)
  }

  // const result = await bat.commit()
  console.log('all done ')
}

export const createJsonDbFromSheetOld = async () => {
  const datas = await getQuizDatasFromSheetOld()

  fs.writeFileSync(
    'libs/shared/gsquiz/src/lib/quizdb.json',
    JSON.stringify(datas, null, '\t')
  )
}

export const getQuizDB = () => {
  // const qds = quizdb as QuizData[]
  // console.log(qds[0])
}
