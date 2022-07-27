import {
  sharedQuizserver,
  imageFileImporterA,
  imageFileImporter,
} from './shared-quizserver'

describe('sharedQuizserver', () => {
  it('should work', () => {
    expect(sharedQuizserver()).toEqual('shared-quizserver')
  })

  it('xxx', () => {
    const results = imageFileImporterA('srcdir/image')
    console.log(results)
  })

  it('ファイルインポート', () => {
    imageFileImporter('srcdir/image', 'apps/quizapp/public/images')
  })
})
