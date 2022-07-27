import { uploadImage } from '@gsquiz/shared/fbclient'
import { QuizData, QuizDataFieldType } from '@gsquiz/shared/gsquiz-types'
// import { QuizData, QuizDataFieldType } from '@gsquiz/shared/gsquiz'
import styles from './quiz-data-image-uploader.module.css'

/* eslint-disable-next-line */
export interface QuizDataImageUploaderProps {
  qd: QuizData
}

const Uploader = ({
  text,
  sheetid,
  qdid,
  imtype,
}: {
  text: string
  sheetid: string
  qdid: string
  imtype: QuizDataFieldType
}) => {
  return (
    <div className="flex flex-col border-2 ">
      <div>{text}</div>
      <div className="grow"></div>
      <div>
        <input
          className="text-xs"
          type="file"
          name="example"
          accept="image/jpeg, image/png"
          onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
              const f = e.target.files[0]
              const ret = await uploadImage(sheetid, qdid, imtype, f)
              // const ret = await uploadImage(cid, qid, f, 'a1')
              // setAImageUrl(ret)
            }
          }}
        />
      </div>
    </div>
  )
}

export function QuizDataImageUploader({ qd }: QuizDataImageUploaderProps) {
  const sheetid = 'SHEETID'

  // const x: QuizDataFieldType = QuizDataFieldType.
  return (
    <div className="flex flex-row">
      <Uploader
        text={qd.question.text}
        sheetid={sheetid}
        qdid={qd.id}
        imtype={'question'}
      />
      {qd.choices.map((ch, i) => {
        const choiceImTypes: QuizDataFieldType[] = [
          'choice1',
          'choice2',
          'choice3',
          'choice4',
          'choice5',
        ]
        return (
          <Uploader
            text={ch.text}
            sheetid={sheetid}
            qdid={qd.id}
            imtype={choiceImTypes[i]}
          />
        )
      })}
      <Uploader
        text={qd.answer.text}
        sheetid={sheetid}
        qdid={qd.id}
        imtype={'answer'}
      />
    </div>
  )
}

export default QuizDataImageUploader
