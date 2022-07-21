import { AppProps } from 'next/app'
import Head from 'next/head'
// import './styles.css';
import 'tailwindcss/tailwind.css'

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to quizapp!</title>
      </Head>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  )
}

export default CustomApp
