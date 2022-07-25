import { getQuizDatasFromSheet, getSheetValue } from '@gsquiz/shared/gsquiz'
import * as functions from 'firebase-functions'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest(
//   async (request, response) => {
//     console.log('xxxx')
//     const ssid = '1-KEs8GFaZGXNe7WiExFET2Xe91xFK8ORF_Xg_MnpPKo'

//     const v = await getQuizDatasFromSheet()

//     console.log(JSON.stringify(v, null, '\t'))

//     response.send('Hello from Firebase!!!!!!!')
//   }
// )

export const getQuizDatas = functions
  .region('asia-northeast1')
  .https.onCall(async ({ arg }: { arg: any }, context) => {
    // TODO 権限チェック
    // console.log(context)

    const datas = await getQuizDatasFromSheet()

    return datas
  })
