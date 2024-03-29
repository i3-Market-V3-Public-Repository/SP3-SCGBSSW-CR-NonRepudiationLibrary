import { ENC_ALGS, HASH_ALGS, SIGNING_ALGS } from '../constants.js'
import { NrError } from '../errors/index.js'
import { EncryptionAlg, HashAlg, SigningAlg } from '../types.js'

export function algByteLength (alg: EncryptionAlg | HashAlg | SigningAlg): number {
  const algs: string[] = (ENC_ALGS as unknown as string[]).concat(HASH_ALGS as unknown as string[]).concat(SIGNING_ALGS as unknown as string[])
  if (algs.includes(alg)) {
    return Number((alg.match(/\d{3}/) as RegExpMatchArray)[0]) / 8
  }
  throw new NrError('unsupported algorithm', ['invalid algorithm'])
}
