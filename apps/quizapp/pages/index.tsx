import { getFbAuth, useOnAuthChange } from '@gsquiz/shared/fbclient'
import {
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithEmailLink,
  signOut,
  User,
} from 'firebase/auth'
import { useRef, useState } from 'react'

// import styles from './index.module.css';
export function Index() {
  const emailRef = useRef<HTMLInputElement>()
  const passwordRef = useRef<HTMLInputElement>()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const auth = getFbAuth()
  const user = useOnAuthChange()
  // const user = useAnonymousSignIn()

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
    </div>
  )
}

export default Index
