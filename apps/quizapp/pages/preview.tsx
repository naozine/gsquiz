import { PageState, QuizData } from '@gsquiz/shared/gsquiz-types'
import {
  getQuizDb,
  usePageState,
  startQuiz,
  updatePageState,
} from '@gsquiz/shared/quizclient'
import { QuizAnswerView } from '@gsquiz/shared/ui'
import { useSWRConfig } from 'swr'
import { Listbox, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

const Func = ({ ps }: { ps: PageState }) => {
  const { mutate } = useSWRConfig()
  if (ps.state === 'question' || ps.state === 'answer') {
    // console.log(ps)
    return (
      <QuizAnswerView
        state={ps}
        onNext={() => {
          //
          const datas = getQuizDb()
          const i = datas.findIndex(
            (qd) => qd.question.text === ps.qd.question.text
          )
          const nexti = i === datas.length - 1 ? 0 : i + 1

          updatePageState(
            {
              ...ps,
              qd: datas[nexti],
              state: 'question',
            },
            mutate
          )
        }}
      />
    )
  } else {
    return (
      <div>
        <button
          onClick={() => {
            startQuiz(ps, mutate)
          }}
        >
          xxx
        </button>
      </div>
    )
  }
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Preview = () => {
  const { mutate } = useSWRConfig()
  const datas = getQuizDb()
  const ps = usePageState()
  const [selected, setSelected] = useState<QuizData>(datas[3])
  ps.qd = selected
  if (ps.state === 'start') {
    ps.state = 'question'
  }

  const menuText = (qd: QuizData) => {
    return `${qd.id}:${qd.question.text}`
  }

  return (
    <div>
      <div className="max-w-xs">
        <Listbox value={selected} onChange={setSelected}>
          {({ open }) => (
            <>
              {/* <Listbox.Label className="block text-sm font-medium text-gray-700">
                Assigned to
              </Listbox.Label> */}
              <div className="mt-1 relative">
                <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <span className="block truncate">{menuText(selected)}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    {/* <SelectorIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    /> */}
                  </span>
                </Listbox.Button>

                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {datas &&
                      datas.map((person) => (
                        <Listbox.Option
                          key={person.id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? 'text-white bg-indigo-600'
                                : 'text-gray-900',
                              'cursor-default select-none relative py-2 pl-3 pr-9'
                            )
                          }
                          value={person}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={classNames(
                                  selected ? 'font-semibold' : 'font-normal',
                                  'block truncate'
                                )}
                              >
                                {menuText(person)}
                              </span>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-white' : 'text-indigo-600',
                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                  )}
                                >
                                  {/* <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                /> */}
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
      </div>
      <Func ps={ps} />
    </div>
  )
}
export default Preview
