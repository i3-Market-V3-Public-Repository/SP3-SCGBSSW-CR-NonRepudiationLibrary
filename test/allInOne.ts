import { encode } from '@juanelas/base64'
import { randBytes } from 'bigint-crypto-utils'
import { hashable } from 'object-sha'
import { VerificationResolutionPayload } from '../src/ts'
import { ethers } from 'ethers'
import * as _pkg from '#pkg'

describe('Non-repudiation protocol - All in one', function () {
  this.bail() // stop after a test fails
  this.timeout(2000000)

  const SIGNING_ALG: _pkg.SigningAlg = 'ES256'

  const rpcProviderUrl = process.env.RPC_PROVIDER_URL as string
  if (rpcProviderUrl === undefined) {
    throw new Error('You need to pass a RPC_PROVIDER_URL as env variable.\nIf you are not using a wallet, you have to provide a valid RPC for connecting to the DLT.')
  }

  const parsedPrivateKey = process.env.PRIVATE_KEY
  if (parsedPrivateKey === undefined) {
    throw new Error('You need to pass a PRIVATE_KEY as env variable. The associated address should also hold balance enough to interact with the DLT')
  }
  const privateKey = _pkg.parseHex(parsedPrivateKey, true)
  const publicKey = ethers.utils.computePublicKey(privateKey)
  const address = ethers.utils.computeAddress(publicKey)

  const ethersWalletSetup = {
    address,
    privateKey,
    rpcProviderUrl
  }

  let providerDltAgent: _pkg.EthersIoAgentOrig
  let consumerDltAgent: _pkg.EthersIoAgentDest

  let nrpProvider: _pkg.NonRepudiationProtocol.NonRepudiationOrig
  let nrpConsumer: _pkg.NonRepudiationProtocol.NonRepudiationDest
  let crs: _pkg.ConflictResolution.ConflictResolver

  let dataExchangeAgreement: _pkg.DataExchangeAgreement

  this.beforeAll(async () => {
    const block = new Uint8Array(await randBytes(256))

    const consumerJwks: _pkg.JwkPair = await _pkg.generateKeys(SIGNING_ALG, '0x3b7903c8fe18e4ba5329939c7d1c4318307794a544f3eb5fb3b6536210d98677')
    console.log(JSON.stringify({ consumerKeys: consumerJwks }, undefined, 2))

    const providerJwks: _pkg.JwkPair = await _pkg.generateKeys(SIGNING_ALG)
    console.log(JSON.stringify({ providerKeys: providerJwks }, undefined, 2))

    consumerDltAgent = new _pkg.EthersIoAgentDest({ rpcProviderUrl: ethersWalletSetup.rpcProviderUrl })

    providerDltAgent = new _pkg.EthersIoAgentOrig({ rpcProviderUrl: ethersWalletSetup.rpcProviderUrl }, ethersWalletSetup.privateKey)

    dataExchangeAgreement = {
      orig: await _pkg.parseJwk(providerJwks.publicJwk, true),
      dest: await _pkg.parseJwk(consumerJwks.publicJwk, true),
      encAlg: 'A256GCM',
      signingAlg: SIGNING_ALG,
      hashAlg: 'SHA-256',
      ledgerContractAddress: '0x8d407A1722633bDD1dcf221474be7a44C05d7c2F',
      ledgerSignerAddress: ethersWalletSetup.address,
      pooToPorDelay: 10000,
      pooToPopDelay: 30000,
      pooToSecretDelay: 180000 // 3 minutes
    }
    console.log(dataExchangeAgreement)

    nrpProvider = new _pkg.NonRepudiationProtocol.NonRepudiationOrig(dataExchangeAgreement, providerJwks.privateJwk, block, providerDltAgent)
    nrpConsumer = new _pkg.NonRepudiationProtocol.NonRepudiationDest(dataExchangeAgreement, consumerJwks.privateJwk, consumerDltAgent)

    const jwkPair = await _pkg.generateKeys(SIGNING_ALG)
    crs = new _pkg.ConflictResolution.ConflictResolver(jwkPair, new _pkg.EthersIoAgentDest({ rpcProviderUrl: ethersWalletSetup.rpcProviderUrl })
    )
  })

  describe('create/verify proof of origin (PoO)', function () {
    let poo: _pkg.StoredProof<_pkg.PoOPayload>
    this.beforeAll(async function () {
      poo = await nrpProvider.generatePoO()
    })
    it('provider should create a valid signed PoO that is properly verified by the consumer', async function () {
      const verification = await nrpConsumer.verifyPoO(poo.jws, nrpProvider.block.jwe)
      chai.expect(verification).to.not.equal(undefined)
    })
    it('verification should throw error if the PoO is not within date tolerance', async function () {
      const currentDate = new Date(Date.now() - 60 * 3600 * 1000) // 1 hour before

      let err
      try {
        await nrpConsumer.verifyPoO(poo.jws, nrpProvider.block.jwe, { timestamp: currentDate.valueOf() })
      } catch (error) {
        err = error
      }
      chai.expect(err).to.not.equal(undefined)
    })
  })

  describe('create/verify proof of reception (PoR)', function () {
    let por: _pkg.StoredProof<_pkg.PoRPayload>
    this.beforeAll(async function () {
      por = await nrpConsumer.generatePoR()
    })
    it('consumer should create a valid signed PoR that is properly verified by the provider', async function () {
      const verification = await nrpProvider.verifyPoR(por.jws)
      chai.expect(verification).to.not.equal(undefined)
    })
    it('verification should throw error if there is no previously generated PoO', async function () {
      const block = nrpProvider.block
      const poo = block.poo
      delete block.poo
      let err
      try {
        await nrpProvider.verifyPoR(por.jws)
      } catch (error) {
        err = error
      }
      block.poo = poo
      chai.expect(err).to.not.equal(undefined)
    })
    it('verification should throw error if the PoR is not within date tolerance', async function () {
      const currentDate = new Date(Date.now() + 1 * 3600 * 1000) // 1 hour after
      const clockToleranceMs = 1000

      let err
      try {
        await nrpProvider.verifyPoR(por.jws, { timestamp: currentDate.valueOf(), tolerance: clockToleranceMs })
      } catch (error) {
        err = error
      }
      chai.expect(err).to.not.equal(undefined)
    })
  })

  describe('create/verify proof of publication (PoP)', function () {
    this.timeout(120000)
    let pop: _pkg.StoredProof<_pkg.PoPPayload>
    this.beforeAll(async function () {
      pop = await nrpProvider.generatePoP()
    })
    it('provider should create a valid signed PoP that is properly verified by the consumer', async function () {
      const verified = await nrpConsumer.verifyPoP(pop.jws)
      console.log(JSON.stringify(verified.payload, undefined, 2))
      chai.expect(verified).to.not.equal(undefined)
    })
    it('verification should throw error if there is no PoR', async function () {
      const block = nrpConsumer.block
      const por = block.por
      delete block.por
      let err
      try {
        await nrpConsumer.verifyPoP(pop.jws)
      } catch (error) {
        err = error
      }
      block.por = por
      chai.expect(err).to.not.equal(undefined)
    })
    it('verification should throw error if the PoP is not within date tolerance', async function () {
      const currentDate = new Date(Date.now() + 60 * 3600 * 1000) // 1 hour after
      const clockToleranceMs = 1

      let err
      try {
        await nrpConsumer.verifyPoP(pop.jws, { timestamp: currentDate.valueOf(), tolerance: clockToleranceMs })
      } catch (error) {
        err = error
      }
      chai.expect(err).to.not.equal(undefined)
    })
  })

  describe('decrypt and verify decrypted cipherblock', function () {
    it('consumer should be able to decrypt and hash(decrypted block) should be equal to the dataExchange.blockCommitment', async function () {
      const decryptedBlock = await nrpConsumer.decrypt()
      chai.expect(hashable(nrpProvider.block.raw)).to.equal((decryptedBlock !== undefined) ? hashable(decryptedBlock) : '')
    })
    it('should throw error if there is no secret yet', async function () {
      const secret = nrpConsumer.block.secret
      delete nrpConsumer.block.secret

      let err
      try {
        await nrpConsumer.decrypt()
      } catch (error) {
        err = error
      }
      nrpConsumer.block.secret = secret
      chai.expect(err).to.not.equal(undefined)
    })
    it('it should throw error if hash(decrypted block) != committed block digest', async function () {
      const append = '123'
      const exchange = nrpConsumer.exchange as _pkg.DataExchange
      exchange.blockCommitment = nrpConsumer.exchange?.blockCommitment as string + append
      let err
      try {
        await nrpConsumer.decrypt()
      } catch (error) {
        err = error
      }
      // restore the block commitment
      exchange.blockCommitment = exchange.blockCommitment.substring(0, exchange.blockCommitment.length - append.length)

      chai.expect(err).to.not.equal(undefined)
    })
  })

  describe('get secret from ledger', function () {
    const timeout = 180000 // 3 minutes (we currently have one block every 2 minutes)
    this.timeout(timeout)
    it('should be the same secret as the one obtained in the PoP', async function () {
      const secret = { ...nrpConsumer.block.secret }
      const secretFromLedger = await nrpConsumer.getSecretFromLedger()
      chai.expect(hashable(secret)).to.equal(hashable(secretFromLedger))
      nrpConsumer.block.secret = secret as _pkg.Block['secret']
    })
  })

  describe('verification request', function () {
    let verificationRequestConsumer: string
    let verificationRequestProvider: string

    it('a consumer should be able to generate a valid JWS', async function () {
      verificationRequestConsumer = await nrpConsumer.generateVerificationRequest()
      const verified = await _pkg.jwsDecode(verificationRequestConsumer, nrpConsumer.jwkPairDest.publicJwk)
      chai.expect(verified.payload).to.not.equal(undefined)
    })
    it('the consumer\'s verification req is verified and executed by the CRS, and, since the protocol completed, resolution is \'completed\'', async function () {
      const resolution = await crs.resolveCompleteness(verificationRequestConsumer)
      const { payload } = await _pkg.ConflictResolution.verifyResolution<VerificationResolutionPayload>(resolution)
      chai.expect(payload.resolution).to.equal('completed')
    })
    it('a provider should be able to generate a valid JWS', async function () {
      verificationRequestProvider = await nrpProvider.generateVerificationRequest()
      console.log(verificationRequestProvider)
      const verified = await _pkg.jwsDecode(verificationRequestProvider, nrpProvider.jwkPairOrig.publicJwk)
      chai.expect(verified.payload).to.not.equal(undefined)
    })
    it('the provider\'s verification req is properly verified by the CRS', async function () {
      const resolution = await crs.resolveCompleteness(verificationRequestProvider)
      const { payload } = await _pkg.ConflictResolution.verifyResolution<_pkg.VerificationResolutionPayload>(resolution, crs.jwkPair.publicJwk)
      console.log(JSON.stringify(payload, undefined, 2))
      chai.expect(payload.resolution).to.equal('completed')
    })
    it('verification should throw error if it holds an invalid PoR', async function () {
      const jws = verificationRequestProvider
      const [headerb64, , signatureb64] = jws.split('.')
      const { payload } = await _pkg.jwsDecode<_pkg.VerificationRequestPayload>(jws)
      payload.por = payload.por.replace(/[a-zA-Z]/g, () => '2')
      const jws2 = [headerb64, encode(JSON.stringify(payload), true, false), signatureb64].join('.')
      let err: _pkg.NrError = new _pkg.NrError(new Error('error'), ['unexpected error'])
      try {
        await crs.resolveCompleteness(jws2)
      } catch (error) {
        err = error as _pkg.NrError
      }
      chai.expect(err.nrErrors.includes('invalid por')).to.equal(true)
    })
    it('should fail if there is no previous PoR (consumer side)', async function () {
      const block = nrpConsumer.block
      const por = block.por
      delete block.por
      let err
      try {
        await nrpConsumer.generateVerificationRequest()
      } catch (error) {
        err = error
      }
      block.por = por
      chai.expect(err).to.not.equal(undefined)
    })
    it('should fail if there is no previous PoR (provider side)', async function () {
      const block = nrpProvider.block
      const por = block.por
      delete block.por
      let err
      try {
        await nrpProvider.generateVerificationRequest()
      } catch (error) {
        err = error
      }
      block.por = por
      chai.expect(err).to.not.equal(undefined)
    })
    it('the CRS will send error if the request has bad format', async function () {
      const verificationRequestConsumer2 = 'ñ' + verificationRequestConsumer.substring(1)
      let err: _pkg.NrError = new _pkg.NrError(new Error('error'), ['unexpected error'])
      try {
        await crs.resolveCompleteness(verificationRequestConsumer2)
      } catch (error) {
        err = error as _pkg.NrError
      }
      chai.expect(err.nrErrors.includes('not a compact jws')).to.equal(true)
    })
    it('the CRS will send error if the request has an invalid signature', async function () {
      const [header, payload, signature] = verificationRequestConsumer.split('.')
      const modifiedSignature = signature.replace(/[a-zA-Z]/g, () => '2')
      const verificationRequestConsumer2 = [header, payload, modifiedSignature].join('.')
      let err: _pkg.NrError = new _pkg.NrError(new Error(), ['unexpected error'])
      try {
        await crs.resolveCompleteness(verificationRequestConsumer2)
      } catch (error) {
        err = error as _pkg.NrError
      }
      chai.expect(err.nrErrors.includes('invalid verification request')).to.equal(true)
    })
  })

  describe('dispute request', function () {
    let disputeRequest: string

    it('a consumer should be able to generate it', async function () {
      disputeRequest = await nrpConsumer.generateDisputeRequest()
      console.log(disputeRequest)
      const verified = await _pkg.jwsDecode(disputeRequest, nrpConsumer.jwkPairDest.publicJwk)
      chai.expect(verified.payload).to.not.equal(undefined)
    })
    it('should be denied if the consumer\'s dispute req is properly verified by the CRS and decryption works', async function () {
      const resolution = await crs.resolveDispute(disputeRequest)
      const { payload } = await _pkg.ConflictResolution.verifyResolution<_pkg.DisputeResolutionPayload>(resolution)
      chai.expect(payload.resolution).to.equal('denied')
    })
    it('the CRS will send error if the request has an invalid signature', async function () {
      const [header, payload, signature] = disputeRequest.split('.')
      const modifiedSignature = signature.replace(/[a-zA-Z]/g, () => '2')
      const disputeRequestConsumer2 = [header, payload, modifiedSignature].join('.')
      let err: _pkg.NrError = new _pkg.NrError(new Error(), ['unexpected error'])
      try {
        await crs.resolveDispute(disputeRequestConsumer2)
      } catch (error) {
        err = error as _pkg.NrError
      }
      chai.expect(err.nrErrors.includes('jws verification failed')).to.equal(true)
    })

    it('should fail if there is no previous PoR', async function () {
      const block = nrpConsumer.block
      const por = block.por
      delete block.por
      let err
      try {
        await nrpConsumer.generateDisputeRequest()
      } catch (error) {
        err = error
      }
      block.por = por
      chai.expect(err).to.not.equal(undefined)
    })
    it('should fail if there is no previously received cipherblock', async function () {
      const block = nrpConsumer.block
      const jwe = block.jwe
      delete block.jwe
      let err
      try {
        await nrpConsumer.generateDisputeRequest()
      } catch (error) {
        err = error
      }
      block.jwe = jwe
      chai.expect(err).to.not.equal(undefined)
    })
  })

  describe('testing with invalid claims', function () {
    it('using \'issr\' instead of \'iss\' should throw error', async function () {
      const expectedPayload = {
        issr: 'orig',
        exchange: nrpConsumer.exchange,
        proofType: 'PoO'
      }
      let err
      try {
        await _pkg.verifyProof(nrpConsumer.block?.poo?.jws as string, expectedPayload as unknown as _pkg.NrProofPayload)
      } catch (error) {
        err = error
      }
      chai.expect(err).to.not.equal(undefined)
    })
    it('adding unknown property \'x\' to expectedDataExchange claims should throw error', async function () {
      const expectedPayload = {
        proofType: 'PoO',
        iss: 'orig',
        x: 'afasf',
        exchange: nrpConsumer.exchange
      }
      let err
      try {
        await _pkg.verifyProof(nrpConsumer.block?.poo?.jws as string, expectedPayload as unknown as _pkg.PoOPayload)
      } catch (error) {
        err = error
      }
      chai.expect(err).to.not.equal(undefined)
    })
    it('property in expectedDataExchange different that in the dataExchange should throw error', async function () {
      const expectedPayload: Omit<_pkg.PoRPayload, 'iat'> = {
        // @ts-expect-error
        iss: 'orig',
        // @ts-expect-error
        proofType: 'por',
        exchange: {
          ...nrpConsumer.exchange as _pkg.DataExchange,
          dest: 'asdfdgdg'
        }
      }
      let err
      try {
        await _pkg.verifyProof(nrpConsumer.block?.poo?.jws as string, expectedPayload)
      } catch (error) {
        err = error
      }
      chai.expect(err).to.not.equal(undefined)
    })
  })

  describe('testing with invalid key', function () {
    it('should throw error', async function () {
      const expectedPayload: Omit<_pkg.NrProofPayload, 'iat'> = {
        iss: 'orig',
        proofType: 'por',
        exchange: {
          ...nrpConsumer.exchange as _pkg.DataExchange,
          dest: 'asdfdgdg'
        }
      }
      let err
      try {
        await _pkg.verifyProof(nrpConsumer.block?.poo?.jws as string, expectedPayload)
      } catch (error) {
        err = error
      }
      chai.expect(err).to.not.equal(undefined)
    })
  })

  describe('testing with a jwk with no \'alg\'', function () {
    it('createProof should throw error', async function () {
      let err
      try {
        const jwk = { ...nrpProvider.jwkPairOrig.privateJwk }
        // @ts-expect-error
        delete jwk.alg
        const payload: Omit<_pkg.PoOPayload, 'iat'> = {
          proofType: 'PoO',
          iss: 'orig',
          exchange: nrpProvider.exchange
        }
        await _pkg.createProof(payload, jwk)
      } catch (error) {
        err = error
      }
      chai.expect(err).to.not.equal(undefined)
    })
  })
})
