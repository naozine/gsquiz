import { getQuizDatasFromSheet, QuizData } from '@gsquiz/shared/gsquiz'
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import { useEffect, useState } from 'react'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCLBzcTE4c2NtPwhDn6jqHD2EAMhA1oCVQ',
  authDomain: 'gsumiquiz.firebaseapp.com',
  projectId: 'gsumiquiz',
  storageBucket: 'gsumiquiz.appspot.com',
  messagingSenderId: '327725788154',
  appId: '1:327725788154:web:144ed7be973972449b9243',
  measurementId: 'G-S9SKD0KN5L',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const ImageupLoader = () => {
  // const qdatas = await getQuizDatasFromSheet()
  const [_qdatas, setQdatas] = useState<QuizData[]>()

  const qdatas = _qdatas ? _qdatas : []

  useEffect(() => {
    const af = async () => {
      const functions = getFunctions(app)
      connectFunctionsEmulator(functions, 'localhost', 5001)
      functions.region = 'asia-northeast1'
      const getQuizDatas = httpsCallable<any, QuizData[]>(
        functions,
        'getQuizDatas'
      )
      const ret = await getQuizDatas({ aaa: 'aaa' })

      setQdatas(ret.data)
    }
    af()
  }, [])

  return (
    <div>
      {qdatas.map((qd, i) => {
        return <div key={`qdata_${i}`}>{qd.question.text}</div>
      })}
    </div>
  )
}
export default ImageupLoader
