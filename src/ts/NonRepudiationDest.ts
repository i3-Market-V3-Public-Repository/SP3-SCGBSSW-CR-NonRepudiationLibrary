import { ethers } from 'ethers'
import { JWK, JWTVerifyResult } from 'jose'

import { jweDecrypt } from './jwe'
import { HASH_ALG } from './constants'
import { createProof } from './createProof'
import { ContractConfig, DataExchange, DataExchangeInit, DestBlock, DltConfig, JwkPair, PoOPayload, PoPPayload, PoRPayload } from './types'
import { sha } from './sha'
import { verifyKeyPair } from './verifyKeyPair'
import { verifyProof } from './verifyProof'

import contractConfigDefault from '../besu/NonRepudiation'

/**
 * The base class that should be instantiated by the destination of a data
 * exchange when non-repudiation is required. In the i3-MARKET ecosystem it is
 * likely to be a Consumer.
 */
export class NonRepudiationDest {
  exchange: DataExchangeInit
  jwkPairDest: JwkPair
  publicJwkOrig: JWK
  block?: DestBlock
  dltConfig: DltConfig
  checked: boolean

  /**
   *
   * @param exchangeId - the id of this data exchange. It MUST be unique
   * @param jwkPairDest - a pair of private and public keys owned by this entity (non-repudiation dest)
   * @param publicJwkOrig - the public key as a JWK of the other peer (non-repudiation orig)
   * @param dltConfig - an object with the necessary configuration for the (Ethereum-like) DLT
   */
  constructor (exchangeId: DataExchange['id'], jwkPairDest: JwkPair, publicJwkOrig: JWK, dltConfig?: DltConfig) {
    this.jwkPairDest = jwkPairDest
    this.publicJwkOrig = publicJwkOrig
    this.exchange = {
      id: exchangeId,
      orig: JSON.stringify(this.publicJwkOrig),
      dest: JSON.stringify(this.jwkPairDest.publicJwk),
      hashAlg: HASH_ALG
    }
    this.dltConfig = this._dltSetup(dltConfig)
    this.checked = false
  }

  private _dltSetup (providedDltConfig?: DltConfig): DltConfig {
    const dltConfig = {
      gasLimit: 12500000,
      rpcProviderUrl: '***REMOVED***',
      disable: false,
      ...providedDltConfig
    }
    if (!dltConfig.disable) {
      dltConfig.contractConfig = dltConfig.contractConfig ?? (contractConfigDefault as ContractConfig)
      const rpcProvider = new ethers.providers.JsonRpcProvider(dltConfig.rpcProviderUrl)

      dltConfig.contract = new ethers.Contract(dltConfig.contractConfig.address, dltConfig.contractConfig.abi, rpcProvider)
    }

    return dltConfig
  }

  /**
   * Initialize this instance. It MUST be invoked before calling any other method.
   */
  async init (): Promise<void> {
    await verifyKeyPair(this.jwkPairDest.publicJwk, this.jwkPairDest.privateJwk)
    this.checked = true
  }

  /**
   * Verifies a proof of origin against the received cipherblock.
   * If verification passes, `pop` and `cipherblock` are added to this.block
   *
   * @param poo - a Proof of Origin (PoO) in compact JWS format
   * @param cipherblock - a cipherblock as a JWE
   * @returns the verified payload and protected header
   *
   */
  async verifyPoO (poo: string, cipherblock: string): Promise<JWTVerifyResult> {
    this._checkInit()

    const dataExchange: DataExchangeInit = {
      ...this.exchange,
      cipherblockDgst: await sha(cipherblock, this.exchange.hashAlg)
    }
    const expectedPayloadClaims: PoOPayload = {
      proofType: 'PoO',
      iss: 'orig',
      exchange: dataExchange
    }
    const verified = await verifyProof(poo, this.publicJwkOrig, expectedPayloadClaims)

    this.block = {
      jwe: cipherblock,
      poo: poo
    }

    this.exchange = (verified.payload as PoOPayload).exchange

    return verified
  }

  /**
   * Creates the proof of reception (PoR).
   * Besides returning its value, it is also stored in `this.block.por`
   *
   * @returns a compact JWS with the PoR
   */
  async generatePoR (): Promise<string> {
    this._checkInit()

    if (this.block?.poo === undefined) {
      throw new Error('Before computing a PoR, you have first to receive a valid cipherblock with a PoO and validate the PoO')
    }

    const payload: PoRPayload = {
      proofType: 'PoR',
      iss: 'dest',
      exchange: this.exchange,
      pooDgst: await sha(this.block.poo)
    }
    this.block.por = await createProof(payload, this.jwkPairDest.privateJwk)
    return this.block.por
  }

  /**
   * Verifies a received Proof of Publication (PoP) with the received secret and verificationCode
   * @param pop - a PoP in compact JWS
   * @param secret - the JWK secret that was used to encrypt the block
   * @returns the verified payload and protected header
   */
  async verifyPoP (pop: string, secret: JWK): Promise<JWTVerifyResult> {
    this._checkInit()

    if (this.block?.por === undefined) {
      throw new Error('Cannot verify a PoP if not even a PoR have been created')
    }

    /**
     * TO-DO: obtain verification code from the blockchain
     * TO-DO: Pass secret to raw hex
     */
    let verificationCode = 'verificationCode'

    if (this.dltConfig.disable !== true) {
      const signerAddress = '0x17bd12C2134AfC1f6E9302a532eFE30C19B9E903'
      verificationCode = await new Promise((resolve, reject) => {
        this.dltConfig.contract?.on('Registration', (sender, dataExchangeId, secret) => {
          if (sender === signerAddress) {
            resolve((secret as ethers.BigNumber).toHexString())
          }
        })
      })
    }

    const expectedPayloadClaims: PoPPayload = {
      proofType: 'PoP',
      iss: 'orig',
      exchange: this.exchange,
      porDgst: await sha(this.block.por),
      secret: JSON.stringify(secret),
      verificationCode
    }
    const verified = await verifyProof(pop, this.publicJwkOrig, expectedPayloadClaims)
    this.block.secret = secret
    this.block.pop = pop

    return verified
  }

  /**
   * Decrypts the cipherblock once all the previous proofs have been verified
   * @returns the decrypted block
   *
   * @throws Error if the previous proofs have not been verified or the decrypted block does not meet the committed one
   */
  async decrypt (): Promise<Uint8Array> {
    this._checkInit()

    if (this.block?.pop === undefined || this.block?.secret === undefined) {
      throw new Error('Cannot decrypt if the PoP/secret has not been verified ')
    }

    const decryptedBlock = (await jweDecrypt(this.block.jwe, this.block.secret)).plaintext
    const decryptedDgst = await sha(decryptedBlock)
    if (decryptedDgst !== this.exchange.blockCommitment) {
      throw new Error('Decrypted block does not meet the committed one')
    }
    this.block.raw = decryptedBlock

    return decryptedBlock
  }

  private _checkInit (): void {
    if (!this.checked) {
      throw new Error('NOT INITIALIZED. Before calling any other method, initialize this instance of NonRepudiationOrig calling async method init()')
    }
  }
}
