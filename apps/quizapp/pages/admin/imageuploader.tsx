import { getQuizDatas } from '@gsquiz/shared/fbclient'
import { QuizData } from '@gsquiz/shared/gsquiz'
import { QuizDataImageUploader } from '@gsquiz/shared/ui'

import { useEffect, useState } from 'react'

const ImageupLoader = () => {
  const [_qdatas, setQdatas] = useState<QuizData[]>()

  const qdatas = _qdatas ? _qdatas : []

  useEffect(() => {
    const af = async () => {
      const ret = await getQuizDatas({ aaa: 'aaa' })
      setQdatas(ret.data)
    }
    af()
  }, [])

  return (
    <div>
      {qdatas.map((qd, i) => {
        return <QuizDataImageUploader key={`qdiu${i}`} qd={qd} />
      })}
    </div>
  )
}
export default ImageupLoader
