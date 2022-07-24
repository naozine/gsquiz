import { ComponentStory, ComponentMeta } from '@storybook/react'
import { QuizDataImageUploader } from './quiz-data-image-uploader'

export default {
  component: QuizDataImageUploader,
  title: 'QuizDataImageUploader',
} as ComponentMeta<typeof QuizDataImageUploader>

const Template: ComponentStory<typeof QuizDataImageUploader> = (args) => (
  <QuizDataImageUploader {...args} />
)

export const Primary = Template.bind({})
Primary.args = {
  qd: {
    id: '1',
    question: {
      text: '神奈川県で最も人口が多い市は？',
    },
    choices: [
      { text: '横浜市', correct: true },
      { text: '川崎市', correct: false },
      { text: '相模原市', correct: false },
    ],
    answer: {
      text: '横浜市の人口は、２位の川崎市よりも倍以上多いよ！',
    },
  },
}
