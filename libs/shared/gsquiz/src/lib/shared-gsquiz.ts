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
