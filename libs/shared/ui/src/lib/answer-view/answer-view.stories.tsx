import { ComponentStory, ComponentMeta } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { AnswerView } from './answer-view'

export default {
  component: AnswerView,
  title: 'AnswerView',
} as ComponentMeta<typeof AnswerView>

const Template: ComponentStory<typeof AnswerView> = (args) => (
  <AnswerView {...args} />
)

export const Primary = Template.bind({})
Primary.args = {
  qd: {
    id: '1',
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
      text2: 'イワシは「ワシ」、ワカサギは「サギ」の友達',
    },
  },
  onClick: action('clicked'),
}
