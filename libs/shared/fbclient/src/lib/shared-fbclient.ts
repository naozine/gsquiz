import { QuizData, QuizDataFieldType } from '@gsquiz/shared/gsquiz'
import { FirebaseApp, getApp, initializeApp } from 'firebase/app'
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  User,
} from 'firebase/auth'
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
import { useEffect } from 'react'
import useSWR, { useSWRConfig } from 'swr'

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
    // console.log(e)
    console.log('first initialize firebase')
  }
  if (!app) {
    app = initializeApp(firebaseConfig)
    const functions = getFunctions()
    connectFunctionsEmulator(functions, 'localhost', 5001)
    functions.region = 'asia-northeast1'
  }

  return app
}

export const getFbAuth = () => {
  return getAuth(getFbApp())
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

export const useGoogleSignIn = () => {
  const swrkey = 'useGoogleSignIn'
  const { data } = useSWR<User>(swrkey, null)
  const { mutate } = useSWRConfig()
  const auth = getFbAuth()

  useEffect(() => {
    const af = async () => {
      const ret = await getRedirectResult(auth)
      if (ret) {
        await mutate<User>(swrkey, ret.user)
      } else {
        const provider = new GoogleAuthProvider()
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
        await signInWithRedirect(auth, provider)
      }

      // const ret = await signInWithPopup(auth, provider)
      // await mutate<User>(swrkey, ret.)
    }
    af().then((e) => {
      console.log(e)
    })
  }, [])

  return data
}

export const useAnonymousSignIn = () => {
  const swrkey = 'useAnonymouseSignIn'
  const { data } = useSWR<User>(swrkey, null)
  const { mutate } = useSWRConfig()
  const auth = getFbAuth()

  useEffect(() => {
    const af = async () => {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          const ret = signInAnonymously(auth).then((ret) => {
            console.log(`sign in anonymous: ${ret.user.uid}`)
          })
        } else {
          //
          mutate<User>(swrkey, user)
        }
      })
    }
    af().then((e) => {
      console.log(e)
    })
  }, [])

  return data
}

const SWRKEY_useOnAuthChange = 'useOnAuthChange'

export const useOnAuthChange = () => {
  const { data } = useSWR<User | null>(SWRKEY_useOnAuthChange, null)

  const { mutate } = useSWRConfig()

  useEffect(() => {
    const unsubscribed = onAuthStateChanged(getFbAuth(), (user) => {
      if (user) {
        mutate<User | null>(SWRKEY_useOnAuthChange, user)
      } else {
        mutate<User | null>(SWRKEY_useOnAuthChange, null)
      }
    })
    return () => {
      if (unsubscribed) {
        unsubscribed()
      }
    }
  }, [])

  return data
}
