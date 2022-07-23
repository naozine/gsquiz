import { google } from 'googleapis'
import { QuizData } from './shared-gsquiz-types'

export function sharedGsquiz(): string {
  return 'shared-gsquiz'
}

const ssauth = async () => {
  const auth = await google.auth.getClient({
    keyFile: process.env['GOOGLE_SHEETS_API_CREDENTIALS'],
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return auth
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
  const sid = process.env['QUIZ_DATA_SHEET_ID'] as string
  const values = await getSheetValue(sid, 'クイズデータ!A3:X')

  const datas = values.map((f) => {
    const qd: QuizData = {
      question: {
        text: f[0],
      },
      choices: [
        {
          text: f[2],
          correct: f[3] === 'TRUE',
        },
        {
          text: f[5],
          correct: f[6] === 'TRUE',
        },
        {
          text: f[8],
          correct: f[9] === 'TRUE',
        },
        {
          text: f[11],
          correct: f[12] === 'TRUE',
        },
        {
          text: f[14],
          correct: f[15] === 'TRUE',
        },
      ],
      answer: {
        text: f[17],
      },
    }
    return qd
  })

  return datas
}
