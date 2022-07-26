import {
  getQuizDatasFromSheet,
  PageState,
  setFirestoreFromSheetOld,
} from '@gsquiz/shared/gsquiz'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'
// import { setFirestoreFromSheetOld } from '../../../libs/shared/gsquiz/src/lib/shared-gsquiz'

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

initializeApp({
  credential: applicationDefault(),
})

export const getQuizDatas = functions
  .region('asia-northeast1')
  .https.onCall(async ({ arg }: { arg: any }, context) => {
    // TODO 権限チェック
    // console.log(context)

    const datas = await getQuizDatasFromSheet()

    return datas
  })

export const updateQuizDatas = functions
  .region('asia-northeast1')
  .https.onCall(async ({ arg }: { arg: any }, context) => {
    // TODO 権限チェック
    // console.log(context)

    // const datas = await getQuizDatasFromSheet()

    // return datas

    await setFirestoreFromSheetOld()
  })

export const startQuiz = functions
  .region('asia-northeast1')
  .https.onCall(async ({ arg }: { arg: any }, context) => {
    const uid = context.auth.uid
    if (!uid) {
      return
    }

    // リッスン用ドキュメントを作る
    const db = getFirestore()
    const docref = db.doc(`PageState/${uid}`)
    const ps: PageState = {
      quizNo: 0,
      state: 'start',
    }
    await docref.set(ps)
  })
