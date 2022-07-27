import { ComponentStory, ComponentMeta } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { QuizView } from './quiz-view'

export default {
  component: QuizView,
  title: 'QuizView',
} as ComponentMeta<typeof QuizView>

const Template: ComponentStory<typeof QuizView> = (args) => (
  <QuizView {...args} />
)

export const Primary = Template.bind({})
Primary.args = {
  qd: {
    id: '13',
    question: {
      text: 'なぞなぞだよ。つぎのうち、鳥のお友達がいないのは何番かな？',
      rubyHtml: [
        ['なぞなぞだよ。つぎのうち、', ''],
        ['鳥', 'とり'],
        ['のお', ''],
        ['友達', 'ともだち'],
        ['がいないのは', ''],
        ['何番', 'なんばん'],
        ['かな？', ''],
      ],
    },
    choices: [
      { text: 'サンマ', correct: true },
      { text: 'イワシ', correct: false },
      { text: 'ワカサギ', correct: false },
    ],
    answer: {
      text: '正解は①サンマだよ',
    },
  },
  onClick: action('clicked'),
}
