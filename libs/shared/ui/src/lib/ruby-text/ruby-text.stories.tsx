import { ComponentStory, ComponentMeta } from '@storybook/react'
import { RubyText } from './ruby-text'

export default {
  component: RubyText,
  title: 'RubyText',
} as ComponentMeta<typeof RubyText>

const Template: ComponentStory<typeof RubyText> = (args) => (
  <RubyText {...args} />
)

export const Primary = Template.bind({})
Primary.args = {
  text: 'なぞなぞだよ。つぎのうち、鳥のお友達がいないのは何番かな？',
  words: [
    ['なぞなぞだよ。つぎのうち、', ''],
    ['鳥', 'とり'],
    ['のお', ''],
    ['友達', 'ともだち'],
    ['がいないのは', ''],
    ['何番', 'なんばん'],
    ['かな？', ''],
  ],
}

export const ST2 = Template.bind({})
ST2.args = {
  text: 'なぞなぞだよ。つぎのうち、鳥のお友達がいないのは何番かな？',
}
