import { Multicall } from 'ethereum-multicall'
import { BigNumber } from 'ethers'
import { uniq } from 'lodash'
import { CHAIN_ID, PLD_ADDRESS, POOL_IDS, POSITION_ADDRESS, Z2_ADDRESS, ZERO_ADDRESS, loadConfig } from './config'
import { getMultiCallCompute, getMultiCallConfig, getMultiCallPrice } from './helper/resource'
import { getRPC } from './helper/rpc'
import { ILog, IPoolsCompute, IPoolsConfig, IPoolsSpot } from './types'
import { IEW, bn, decodeERC1155TransferLog, decodeERC20TransferLog, num, parseMultiCallResponse } from './utils/utils'
const ERC20_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const ERC1155_TRANSFER_TOPIC = '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62'
export const getRank = async (
  getLogsInprogressCallBack?: (fromBlock: number, toBlock: number) => void,
  getLogsCallBack?: (logsLength: number) => void,

  getPriceInprogressCallBack?: (pool: string[]) => void,
  getPricesCallBack?: (poolsSpot: IPoolsSpot) => void,

  participationsCallback?: (wallets: string[], illegalWallets: { address: String; reason: String; txHash: String }[]) => void,

  computeInprogressCallBack?: (computes: string[]) => void,
  computeCallBack?: (computesValue: string[]) => void,
) => {
  const { networkConfig, uniV3Pools } = await loadConfig(CHAIN_ID)
  const provider = getRPC(networkConfig)
  const currentBlock = 33510200
  if (getLogsInprogressCallBack) getLogsInprogressCallBack(0, currentBlock)
  let logs: ILog[] = []
  logs = await provider.getLogs({
    fromBlock: 0,
    toBlock: currentBlock,
    address: [PLD_ADDRESS, POSITION_ADDRESS],
    topics: [[ERC20_TRANSFER_TOPIC, ERC1155_TRANSFER_TOPIC]],
  })
  if (getLogsCallBack) getLogsCallBack(logs.length)
  // const jsonData = JSON.stringify(logs, null, 2)
  // const filePath = 'logs.json'
  // fs.writeFileSync(filePath, jsonData)
  const erc20Balance: { [address: string]: BigNumber } = {}
  const logGroups: { [txHash: string]: ILog[] } = logs.reduce((result: any, log) => {
    if (!result[log.transactionHash]) {
      result[log.transactionHash] = []
    }
    if (log.topics[0] === ERC20_TRANSFER_TOPIC) {
      const dLog = decodeERC20TransferLog(log)
      if (!erc20Balance[dLog.from]) erc20Balance[dLog.from] = bn(0)
      if (!erc20Balance[dLog.to]) erc20Balance[dLog.to] = bn(0)
      erc20Balance[dLog.from] = erc20Balance[dLog.from].sub(dLog.value)
      erc20Balance[dLog.to] = erc20Balance[dLog.to].add(dLog.value)
    }
    result[log.transactionHash].push(log)
    return result
  }, {})
  const participations: string[] = []
  const illegalParticipations: { address: String; reason: String; txHash: String }[] = []
  const participationsBalance: { [address: string]: { [pool: string]: { [side: string]: BigNumber } } } = {}
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
        const side = '0x' + id._hex.slice(2, 4)
        const poolAddress = '0x' + id._hex.slice(4)

        const paths = [from, to]
        paths.forEach((path) => {
          if (!participationsBalance[path]) {
            participationsBalance[path] = {}
          }
          if (!participationsBalance[path][poolAddress]) {
            participationsBalance[path][poolAddress] = {}
          }
          if (!participationsBalance[path][poolAddress][side]) {
            participationsBalance[path][poolAddress][side] = bn(0)
          }
        })
        participationsBalance[from][poolAddress][side] = participationsBalance[from][poolAddress][side].sub(value)
        participationsBalance[to][poolAddress][side] = participationsBalance[to][poolAddress][side].add(value)
      })
    }
  })
  if (participationsCallback) participationsCallback(participations, illegalParticipations)
  const multicall = new Multicall({
    multicallCustomContractAddress: networkConfig.helperContract.multiCall,
    ethersProvider: provider,
    tryAggregate: true,
  })
  // 0xd5277A33d1109842128852854176E321e663578d
  // console.log(participations)
  // console.log(illegalParticipations)
  // provider.setStateOverride({})
  let poolsAddress: string[] = []
  Object.keys(participationsBalance).map((pa) => {
    if (participations.includes(pa) || pa === ZERO_ADDRESS) return
    Object.keys(participationsBalance[pa]).map((poolKey) => {
      poolsAddress.push(poolKey)
    })
  })
  poolsAddress = uniq(poolsAddress)
  if (getPriceInprogressCallBack) getPriceInprogressCallBack(poolsAddress)
  const [{ results }] = await Promise.all([multicall.call(getMultiCallConfig(poolsAddress))])

  const poolConfigs: IPoolsConfig = {}
  Object.keys(results).map((key) => {
    const { callsReturnContext } = results[key]
    const returnValues = callsReturnContext[0].returnValues
    if (!callsReturnContext[0].success || returnValues[2] !== PLD_ADDRESS) return
    poolConfigs[key] = {
      fetcher: returnValues[0],
      oracle: '0x' + (returnValues[1] as String).slice(returnValues[1].length - 40, returnValues[1].length),
      type: networkConfig.fetchers && networkConfig.fetchers[returnValues[0]]?.type.includes('3') ? 'uni3' : 'uni2',
      QTI: returnValues[1][2] === '0' ? 0 : 1,
    }
  })

  const [{ results: rawPrices }] = await Promise.all([multicall.call(getMultiCallPrice(poolConfigs))])
  const poolsSpot: IPoolsSpot = {}
  Object.keys(rawPrices).map((key) => {
    const { callsReturnContext } = rawPrices[key]
    const returnValues = callsReturnContext[0].returnValues
    if (returnValues.length <= 3) {
      const [r0, r1] = returnValues
      const [rq, rb] = poolConfigs[key].QTI === 0 ? [bn(r0), bn(r1)] : [bn(r1), bn(r0)]
      const spot = rq.shl(128).div(rb)
      poolsSpot[poolConfigs[key].oracle] = spot
    } else {
      const sqrtPriceX96 = bn(returnValues[0])
      let spot = sqrtPriceX96.shl(32)
      spot = spot.mul(spot).shr(128)
      poolsSpot[poolConfigs[key].oracle] = poolConfigs[key].QTI === 0 ? bn(1).shl(256).div(spot) : spot
    }
  })
  if (getPricesCallBack) getPricesCallBack(poolsSpot)
  const [{ results: rawPoolCompute }] = await Promise.all([multicall.call(getMultiCallCompute(poolConfigs, poolsSpot))])
  const poolComputes: IPoolsCompute = {}
  if (computeInprogressCallBack) computeInprogressCallBack(Object.keys(rawPoolCompute))
  Object.keys(rawPoolCompute).map((key) => {
    const { callsReturnContext } = rawPoolCompute?.[key]
    const returnValues = callsReturnContext[0].returnValues
    const parseData = parseMultiCallResponse(returnValues)
    if (!parseData) return
    const { rA, rB, rC, sA, sB, sC } = parseMultiCallResponse(returnValues)
    poolComputes[key.toLowerCase()] = { rA, rB, rC, sA, sB, sC }
  })
  const participationsValue: { [address: string]: BigNumber } = {}
  participations.map((pa) => {
    if (!participationsBalance[pa]) return
    if (!participationsValue[pa]) participationsValue[pa] = erc20Balance[pa] || bn(0)
    Object.keys(participationsBalance[pa]).map((poolKey) => {
      if (!poolComputes[poolKey]) return
      Object.keys(participationsBalance[pa][poolKey]).map((side) => {
        const rX =
          Number(side) === POOL_IDS.A
            ? poolComputes[poolKey].rA
            : Number(side) === POOL_IDS.B
            ? poolComputes[poolKey].rB
            : poolComputes[poolKey].rC
        const sX =
          Number(side) === POOL_IDS.A
            ? poolComputes[poolKey].sA
            : Number(side) === POOL_IDS.B
            ? poolComputes[poolKey].sB
            : poolComputes[poolKey].sC
        const value = participationsBalance[pa][poolKey][side].mul(rX).div(sX)
        participationsValue[pa] = participationsValue[pa].add(value)
      })
    })
  })
  if (computeCallBack) computeCallBack(Object.keys(participationsValue))
  const arraya: { address: string; balance: string }[] = []
  Object.keys(participationsValue).map((key) => {
    arraya.push({
      address: key,
      balance: IEW(participationsValue[key]),
    })
  })
  arraya.sort((a, b) => num(b.balance) - num(a.balance))
  return { results: arraya, illegalParticipations: illegalParticipations }
}

// 0xd1f294227ed930993098914e829a176b6b1905d2
// 0x03342265f292ac143f9c79dfee076332ae05769e
// 0xd030eff6bcffcd4ef745450a16993ddac3eaf24a
// 0x5fb0ce35c384434c7a905f430326d1135b6857c8
// 0x446fed921f27fb001766cd4ac66ab866a22234eb
