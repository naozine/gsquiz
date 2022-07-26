import { ReactNode } from 'react'

/* eslint-disable-next-line */
export interface FadeInOutProps {
  children: ReactNode
  fadeout?: boolean
}

export function FadeInOut({ children, fadeout = false }: FadeInOutProps) {
  const attr = fadeout ? 'animate-fadeout' : 'animate-fadein opacity-0'
  return (
    <div className={`flex flex-row ${attr}`}>
      <div className="grow" />
      {children}
      <div className="grow" />
    </div>
  )
}

export default FadeInOut
