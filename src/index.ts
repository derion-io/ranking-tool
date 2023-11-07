import { BigNumber } from 'ethers'
import fs from 'fs'
import logsCache from '../logs.json'
import { CHAIN_ID, PLD_ADDRESS, POSITION_ADDRESS, Z2_ADDRESS, loadConfig } from './config'
import { getRPC } from './helper/rpc'
import { ILog } from './types'
import { bn, decodeERC1155TransferLog, decodeERC20TransferLog, num } from './utils/utils'
const ERC20_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const ERC1155_TRANSFER_TOPIC = '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62'
const main = async () => {
  const { networkConfig } = await loadConfig(CHAIN_ID)
  const provider = getRPC(networkConfig)
  const currentBlock = await provider.getBlockNumber()
  let logs: ILog[] = logsCache || []
  if (!logsCache) {
    logs = await provider.getLogs({
      fromBlock: 0,
      toBlock: currentBlock,
      address: [PLD_ADDRESS, POSITION_ADDRESS],
      topics: [[ERC20_TRANSFER_TOPIC, ERC1155_TRANSFER_TOPIC]],
    })
    const jsonData = JSON.stringify(logs, null, 2)
    const filePath = 'logs.json'
    fs.writeFileSync(filePath, jsonData)
  }
  const logGroups: { [txHash: string]: ILog[] } = logs.reduce((result: any, log) => {
    if (!result[log.transactionHash]) {
      result[log.transactionHash] = []
    }
    result[log.transactionHash].push(log)
    return result
  }, {})
  const participations: string[] = []
  const illegalParticipations: { address: String; reason: String; txHash: String }[] = []
  const participationsValue: { [address: string]: { [pool: string]: { [side: string]: BigNumber } } } = {}
  Object.keys(logGroups).map((key) => {
    const logGroup = logGroups[key]
    if (logGroup.length === 1 && logGroup[0].topics[0] === ERC20_TRANSFER_TOPIC) {
      const dLog = decodeERC20TransferLog(logGroups[key][0])
      const pIndex = participations.findIndex((p) => p === dLog.to)
      if (pIndex !== -1) {
        illegalParticipations.push({
          address: dLog.to,
          reason: 'Multi transfer from Z2',
          txHash: key,
        })
        participations.splice(pIndex, 1)
        // }
      } else if (num(bn(dLog.value)) > 500000000000000000000) {
        illegalParticipations.push({
          address: dLog.to,
          reason: 'Recieved > 500 PLD',
          txHash: key,
        })
      } else if (dLog.from !== Z2_ADDRESS) {
        illegalParticipations.push({
          address: dLog.to,
          reason: 'Transfer not from Z2',
          txHash: key,
        })
      } else {
        participations.push(dLog.to)
      }
    } else {
      logGroups[key].map((log) => {
        if (log.topics[0] !== ERC1155_TRANSFER_TOPIC) return
        const { from, to, id, value } = decodeERC1155TransferLog(log)
        // TODO:  Value must be BigNumber
        const side = '0x' + id._hex.slice(2, 4)
        const poolAddress = '0x' + id._hex.slice(4)

        const paths = [from, to]
        paths.forEach((path) => {
          if (!participationsValue[path]) participationsValue[path] = {}
          if (!participationsValue[path][poolAddress]) participationsValue[path][poolAddress] = {}
          if (!participationsValue[path][poolAddress][side]) participationsValue[path][poolAddress][side] = bn(0)
        })
        participationsValue[from][poolAddress][side] = participationsValue[from][poolAddress][side].sub(value)
        participationsValue[to][poolAddress][side] = participationsValue[to][poolAddress][side].add(value)
      })
    }
  })
  console.log(participationsValue)
  console.log(participations[2], participationsValue[participations[2]]['0x446fed921f27fb001766cd4ac66ab866a22234eb']['0x10'].toString())
}
main()
