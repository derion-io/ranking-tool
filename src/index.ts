import { JsonRpcProvider } from '@ethersproject/providers'
import { CHAIN_ID, loadConfig } from './config'

const { AssistedJsonRpcProvider } = require('assisted-json-rpc-provider')
const scanApiKey = 'XGNAITEY1AI67HU25JTZTGSNCAE614F1VD'
const main = async () => {
  const { networkConfig } = await loadConfig(CHAIN_ID)
  const { rpcGetLog, scanApi } = networkConfig
  const rpcProvider: JsonRpcProvider = new JsonRpcProvider(rpcGetLog)
  const assistedProvider =
    typeof scanApi === 'string'
      ? {
          url: scanApi,
          maxResults: 1000,
          rangeThreshold: 0,
          rateLimitCount: 1,
          rateLimitDuration: 5000,
          apiKeys: scanApiKey ? [scanApiKey] : [],
        }
      : scanApi
  const provider = new AssistedJsonRpcProvider(rpcProvider, assistedProvider)
  const currentBlock = await rpcProvider.getBlockNumber()
  const fromBlock = currentBlock - 100000
  const toBlock = currentBlock
  console.log(`Scan from block ${fromBlock} -> ${toBlock}`)
  const logs = await provider.getLogs({
    fromBlock,
    toBlock,
    address: ['0xBa95100a0c3abaD1e10414Be77347D3D0900D8c2', '0x0819281c74bed5423c1b3283808f8e26aad18dbe'],
    topics: [
      [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
      ],
    ],
  })
  console.log(logs)
}
main()
