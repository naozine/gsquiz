/* eslint-disable-next-line */
export interface RubyTextProps {
  text: string
  words?: string[][] | undefined
}

export function RubyText({ text, words }: RubyTextProps) {
  const ws = words ? words : [[text, '']]
  return (
    <div>
      {ws.map((w) => {
        if (w[1].length > 0) {
          return (
            <ruby
              data-ruby={w[1]}
              // className="before:absolute before:text-[0.5em] before:top-[-1em] before:left-0 before:right-0 before:m-auto before:content-[attr(data-ruby)] relative"
            >
              {w[0]}
              {/* <rt className="hidden">{w[1]}</rt> */}
              <rt>{w[1]}</rt>
            </ruby>
          )
        } else {
          return <span>{w[0]}</span>
        }
      })}
    </div>
  )
}

export default RubyText
