import { sharedFbclient } from './shared-fbclient'

describe('sharedFbclient', () => {
  it('should work', () => {
    expect(sharedFbclient()).toEqual('shared-fbclient')
  })
})
