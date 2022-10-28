# Class: I3mServerWalletAgentOrig

[Signers](../modules/Signers.md).I3mServerWalletAgentOrig

## Hierarchy

- `I3mServerWalletAgent`

  ↳ **`I3mServerWalletAgentOrig`**

## Implements

- [`NrpDltAgentOrig`](../interfaces/Signers.NrpDltAgentOrig.md)

## Table of contents

### Constructors

- [constructor](Signers.I3mServerWalletAgentOrig.md#constructor)

### Properties

- [contract](Signers.I3mServerWalletAgentOrig.md#contract)
- [count](Signers.I3mServerWalletAgentOrig.md#count)
- [did](Signers.I3mServerWalletAgentOrig.md#did)
- [dltConfig](Signers.I3mServerWalletAgentOrig.md#dltconfig)
- [provider](Signers.I3mServerWalletAgentOrig.md#provider)
- [wallet](Signers.I3mServerWalletAgentOrig.md#wallet)

### Methods

- [deploySecret](Signers.I3mServerWalletAgentOrig.md#deploysecret)
- [getAddress](Signers.I3mServerWalletAgentOrig.md#getaddress)
- [getContractAddress](Signers.I3mServerWalletAgentOrig.md#getcontractaddress)
- [nextNonce](Signers.I3mServerWalletAgentOrig.md#nextnonce)

## Constructors

### constructor

• **new I3mServerWalletAgentOrig**(`serverWallet`, `did`, `dltConfig?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `serverWallet` | `ServerWallet` |
| `did` | `string` |
| `dltConfig?` | `Partial`<[`DltConfig`](../interfaces/DltConfig.md)\> |

#### Inherited from

I3mServerWalletAgent.constructor

#### Defined in

[src/ts/dlt/agents/I3mServerWalletAgent.ts:12](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/I3mServerWalletAgent.ts#L12)

## Properties

### contract

• **contract**: `Contract`

#### Inherited from

I3mServerWalletAgent.contract

#### Defined in

[src/ts/dlt/agents/EthersIoAgent.ts:11](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/EthersIoAgent.ts#L11)

___

### count

• **count**: `number` = `-1`

The nonce of the next transaction to send to the blockchain. It keep track also of tx sent to the DLT bu not yet published on the blockchain

#### Defined in

[src/ts/dlt/agents/orig/I3mServerWalletAgentOrig.ts:13](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/orig/I3mServerWalletAgentOrig.ts#L13)

___

### did

• **did**: `string`

#### Inherited from

I3mServerWalletAgent.did

#### Defined in

[src/ts/dlt/agents/I3mServerWalletAgent.ts:10](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/I3mServerWalletAgent.ts#L10)

___

### dltConfig

• **dltConfig**: [`DltConfig`](../interfaces/DltConfig.md)

#### Inherited from

I3mServerWalletAgent.dltConfig

#### Defined in

[src/ts/dlt/agents/EthersIoAgent.ts:10](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/EthersIoAgent.ts#L10)

___

### provider

• **provider**: `Provider`

#### Inherited from

I3mServerWalletAgent.provider

#### Defined in

[src/ts/dlt/agents/EthersIoAgent.ts:12](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/EthersIoAgent.ts#L12)

___

### wallet

• **wallet**: `ServerWallet`

#### Inherited from

I3mServerWalletAgent.wallet

#### Defined in

[src/ts/dlt/agents/I3mServerWalletAgent.ts:9](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/I3mServerWalletAgent.ts#L9)

## Methods

### deploySecret

▸ **deploySecret**(`secretHex`, `exchangeId`): `Promise`<`string`\>

Publish the secret for a given data exchange on the ledger.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `secretHex` | `string` | the secret in hexadecimal |
| `exchangeId` | `string` | the exchange id |

#### Returns

`Promise`<`string`\>

a receipt of the deployment. In Ethereum-like DLTs it contains the transaction hash, which can be used to track the transaction on the ledger

#### Implementation of

NrpDltAgentOrig.deploySecret

#### Defined in

[src/ts/dlt/agents/orig/I3mServerWalletAgentOrig.ts:15](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/orig/I3mServerWalletAgentOrig.ts#L15)

___

### getAddress

▸ **getAddress**(): `Promise`<`string`\>

Returns and identifier of the signer's account on the ledger. In Ethereum-like DLTs is the Ethereum address

#### Returns

`Promise`<`string`\>

#### Implementation of

NrpDltAgentOrig.getAddress

#### Defined in

[src/ts/dlt/agents/orig/I3mServerWalletAgentOrig.ts:38](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/orig/I3mServerWalletAgentOrig.ts#L38)

___

### getContractAddress

▸ **getContractAddress**(): `Promise`<`string`\>

Returns the address of the smart contract in use

#### Returns

`Promise`<`string`\>

#### Implementation of

[NrpDltAgentOrig](../interfaces/Signers.NrpDltAgentOrig.md).[getContractAddress](../interfaces/Signers.NrpDltAgentOrig.md#getcontractaddress)

#### Inherited from

I3mServerWalletAgent.getContractAddress

#### Defined in

[src/ts/dlt/agents/EthersIoAgent.ts:26](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/EthersIoAgent.ts#L26)

___

### nextNonce

▸ **nextNonce**(): `Promise`<`number`\>

#### Returns

`Promise`<`number`\>

#### Defined in

[src/ts/dlt/agents/orig/I3mServerWalletAgentOrig.ts:46](https://gitlab.com/i3-market/code/wp3/t3.2/conflict-resolution/non-repudiation-library/-/blob/ba1d70c/src/ts/dlt/agents/orig/I3mServerWalletAgentOrig.ts#L46)