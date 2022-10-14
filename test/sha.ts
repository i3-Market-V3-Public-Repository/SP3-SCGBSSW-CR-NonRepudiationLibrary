import * as _pkg from '#pkg'

describe('testing (input: string|Uint8Array, algorithm: HashAlg)', function () {
  it('should fail if algorithm is not supported', async function () {
    let err
    try {
      // @ts-expect-error
      await _pkg.sha('8jkgyduot', 'MD5')
    } catch (error) {
      err = error
    }
    chai.expect(err).to.not.equal(undefined)
  })
})
