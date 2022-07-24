import { QuizData, QuizDataFieldType } from '@gsquiz/shared/gsquiz'
import { FirebaseApp, getApp, initializeApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { collection, getFirestore, query, where } from 'firebase/firestore'

export function sharedFbclient(): string {
  return 'shared-fbclient'
}

const firebaseConfig = {
  apiKey: 'AIzaSyCLBzcTE4c2NtPwhDn6jqHD2EAMhA1oCVQ',
  authDomain: 'gsumiquiz.firebaseapp.com',
  projectId: 'gsumiquiz',
  storageBucket: 'gsumiquiz.appspot.com',
  messagingSenderId: '327725788154',
  appId: '1:327725788154:web:144ed7be973972449b9243',
  measurementId: 'G-S9SKD0KN5L',
}

export const getFbApp = () => {
  let app: FirebaseApp | undefined = undefined
  try {
    app = getApp()
  } catch (e) {
    console.log(e)
  }
  if (!app) {
    app = initializeApp(firebaseConfig)
    const functions = getFunctions()
    connectFunctionsEmulator(functions, 'localhost', 5001)
    functions.region = 'asia-northeast1'
  }

  return app
}

export const getFbFunctions = () => {
  return getFunctions(getFbApp())
}

export const getFbStorage = () => {
  return getStorage(getFbApp())
}

export const getQuizDatas = httpsCallable<any, QuizData[]>(
  getFbFunctions(),
  'getQuizDatas'
)

export const uploadImage = async (
  sheetid: string,
  qdid: string,
  imtype: QuizDataFieldType,
  file: File
) => {
  const sref = ref(getFbStorage(), `images/${sheetid}/${qdid}/${imtype}`)
  try {
    const uresult = await uploadBytes(sref, file)
    const ret = await getDownloadURL(sref)
    return ret
  } catch (e) {
    console.log(e)
  }

  return ''
}

export const xxx = async () => {
  const db = getFirestore()
  const ref = collection(db, 'xxx')
  const q = query(ref, where('xxx', '!=', 'xxx'))
}
