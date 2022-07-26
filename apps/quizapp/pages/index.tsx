import {
  getFbAuth,
  getFbFunctions,
  useOnAuthChange,
} from '@gsquiz/shared/fbclient'
import {
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithEmailLink,
  signOut,
  User,
} from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { useRef, useState } from 'react'

const rubyHtmlToSpanArray = (html: string) => {
  try {
    const parser = new DOMParser()
    const root = parser.parseFromString(html, 'text/html')

    const nodes = root.childNodes

    const results: string[][] = []

    const nls = (s: string | null) => (s ? s : '')

    nodes.forEach((n) => {
      const nodes2 = n.childNodes
      console.log(nodes2)
      if (nodes2.length > 0) {
        results.push([
          nls(nodes2.item(0).textContent),
          nls(nodes2.item(1).textContent),
        ])
      } else {
        results.push([nls(n.textContent), ''])
      }
    })

    return results
  } catch (e) {
    console.log(e)
  }
  return [['', '']]
}

// import styles from './index.module.css';
export function Index() {
  const emailRef = useRef<HTMLInputElement>()
  const passwordRef = useRef<HTMLInputElement>()

  const user = useOnAuthChange()

  const LoginState = ({ user }: { user: User | undefined | null }) => {
    if (user === undefined) {
      return <div>loading...</div>
    } else if (user === null) {
      return (
        <div>
          <button
            onClick={async () => {
              await signInAnonymously(getFbAuth())
            }}
          >
            signInAnonymously
          </button>
          <hr></hr>
          <div>
            <div>
              <input placeholder="email" ref={emailRef} />
            </div>
            <div>
              <input placeholder="password" ref={passwordRef} />
            </div>

            <button
              onClick={() => {
                //
                console.log({
                  email: emailRef.current.value,
                  password: passwordRef.current.value,
                })
              }}
            >
              sign in with maillink
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div>{`uid: ${user.uid}`}</div>
          <button
            onClick={async () => {
              await signOut(getFbAuth())
            }}
          >
            logout
          </button>
        </div>
      )
    }
  }

  return (
    <div className="bg-gray-50">
      <LoginState user={user} />
      <button
        onClick={async () => {
          const startQuiz = httpsCallable(getFbFunctions(), 'startQuiz')
          await startQuiz('xxx')
        }}
      >
        start
      </button>
    </div>
  )
}

export default Index
