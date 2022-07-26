import { sharedQuizclient } from './shared-quizclient'

describe('sharedQuizclient', () => {
  it('should work', () => {
    expect(sharedQuizclient()).toEqual('shared-quizclient')
  })
})
