/* eslint-disable-next-line */
export interface RubyTextProps {
  text: string | undefined
  words?: string[][] | undefined
}

export function RubyText({ text, words }: RubyTextProps) {
  const ws = words ? words : [[text ? text : '', '']]
  return (
    <div>
      {ws.map((w, i) => {
        if (w[1].length > 0) {
          return (
            <ruby
              key={`rb_${i}`}
              // data-ruby={w[1]}
              // className="before:absolute before:text-[0.5em] before:top-[-1em] before:left-0 before:right-0 before:m-auto before:content-[attr(data-ruby)] relative"
            >
              {w[0]}
              {/* <rt className="hidden">{w[1]}</rt> */}
              <rt>{w[1]}</rt>
            </ruby>
          )
        } else {
          return <span key={`rbsp_${i}`}>{w[0]}</span>
        }
      })}
    </div>
  )
}

export default RubyText
