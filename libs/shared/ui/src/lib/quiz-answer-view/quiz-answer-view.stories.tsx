import { ComponentStory, ComponentMeta } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { QuizAnswerView } from './quiz-answer-view'

export default {
  component: QuizAnswerView,
  title: 'QuizAnswerView',
} as ComponentMeta<typeof QuizAnswerView>

const Template: ComponentStory<typeof QuizAnswerView> = (args) => (
  <QuizAnswerView {...args} />
)

export const Primary = Template.bind({})
Primary.args = {
  state: {
    quizNo: 1,
    state: 'question',
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
        text2: 'イワシは「ワシ」、ワカサギは「サギ」の友達',
      },
    },
  },

  // onClick: action('clicked'),
}

export const P2 = Template.bind({})
P2.args = {
  state: {
    quizNo: 2,
    state: 'answer',
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
  },

  // onClick: action('clicked'),
}
