import { HASH_ALGS } from '../constants.js'
import { NrError } from '../errors/index.js'
import { HashAlg } from '../types.js'

export async function sha (input: string | Uint8Array, algorithm: HashAlg): Promise<Uint8Array> {
  const algorithms = HASH_ALGS
  if (!algorithms.includes(algorithm)) {
    throw new NrError(new RangeError(`Valid hash algorith values are any of ${JSON.stringify(algorithms)}`), ['invalid algorithm'])
  }

  const encoder = new TextEncoder()
  const hashInput = (typeof input === 'string') ? encoder.encode(input).buffer : input

  try {
    let digest
    if (IS_BROWSER) {
      digest = new Uint8Array(await crypto.subtle.digest(algorithm, hashInput))
    } else {
      const nodeAlg = algorithm.toLowerCase().replace('-', '')
      digest = new Uint8Array((await import('crypto')).createHash(nodeAlg).update(Buffer.from(hashInput)).digest()) // eslint-disable-line
    }
    return digest
  } catch (error) {
    throw new NrError(error, ['unexpected error'])
  }
}
