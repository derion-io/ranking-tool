import { BigNumber, ethers } from 'ethers'
import erc20 from '../abi/ERC20.json'
import erc1155 from '../abi/ERC1155.json'
import { ILog } from '../types'
import View from '../abi/View.json'
import { CallReturnContext } from 'ethereum-multicall'
const mdp = require('move-decimal-point')
export const bn = BigNumber.from
export const num = Number
const erc20Interface = new ethers.utils.Interface(erc20)
const erc1155Interface = new ethers.utils.Interface(erc1155)
export const decodeERC20TransferLog = (log: ILog) => {
  const decodedLog = erc20Interface.parseLog(log)
  return {
    address: log.address,
    from: decodedLog.args.from as string,
    to: decodedLog.args.to as string,
    value: decodedLog.args.value as BigNumber,
  }
}

export const decodeERC1155TransferLog = (log: ILog) => {
  const decodedLog = erc1155Interface.parseLog(log)
  return {
    address: log.address,
    from: decodedLog.args.from as string,
    to: decodedLog.args.to as string,
    operator: decodedLog.args.operator as string,
    id: decodedLog.args.id as BigNumber,
    value: decodedLog.args.value as BigNumber,
  }
}

export const parseMultiCallResponse = (returnValues: any[]) => {
  if (returnValues.length === 0) return
  const poolOverrideAbi = View.abi
  const abiInterface = new ethers.utils.Interface(poolOverrideAbi)
  const data = formatMultiCallBignumber(returnValues)
  const encodeData = abiInterface.encodeFunctionResult('compute', [data])
  const formatedData = abiInterface.decodeFunctionResult('compute', encodeData)
  return {
    ...formatedData.stateView,
    ...formatedData.stateView.state,
  }
}

export const formatMultiCallBignumber = (data: any) => {
  return data.map((item: any) => {
    if (item.type === 'BigNumber') {
      item = bn(item.hex)
    }

    if (Array.isArray(item)) {
      item = formatMultiCallBignumber(item)
    }
    return item
  })
}
export const STR = (num: number | string | BigNumber): string => {
  if (!num) {
    return '0'
  }
  switch (typeof num) {
    case 'string':
      if (!num?.includes('e')) {
        return num
      }
      num = Number(num)
    // eslint-disable-next-line no-fallthrough
    case 'number':
      if (!isFinite(num)) {
        return num > 0 ? '∞' : '-∞'
      }
      return num.toLocaleString(['en-US', 'fullwide'], { useGrouping: false })
    default:
      return String(num)
  }
}

export const NUM = (num: number | string | BigNumber): number => {
  if (!num) {
    return 0
  }
  switch (typeof num) {
    case 'number':
      return num
    case 'string':
      if (num === '∞') {
        return Number.POSITIVE_INFINITY
      }
      if (num === '-∞') {
        return Number.NEGATIVE_INFINITY
      }
      return Number.parseFloat(num)
    default:
      return num.toNumber()
  }
}

export const BIG = (num: number | string | BigNumber): BigNumber => {
  if (!num) {
    return BigNumber.from(0)
  }
  switch (typeof num) {
    case 'string':
      if (num?.includes('e')) {
        num = Number(num)
      }
    // eslint-disable-next-line no-fallthrough
    case 'number':
      return BigNumber.from(num || 0)
    default:
      return num
  }
}
export const IEW = (wei: BigNumber | string, decimals: number = 18, decimalsToDisplay?: number): string => {
  let num = mdp(String(wei), -decimals)
  if (decimalsToDisplay != null) {
    num = truncate(num, decimalsToDisplay)
  }
  return num
}

export const WEI = (num: number | string, decimals: number = 18): string => {
  return truncate(mdp(STR(num), decimals))
}
export const truncate = (num: string, decimals: number = 0, rounding: boolean = false): string => {
  let index = Math.max(num.lastIndexOf('.'), num.lastIndexOf(','))
  if (index < 0) {
    index = num.length
  }
  index += decimals + (decimals > 0 ? 1 : 0)
  if (rounding) {
    let shouldRoundUp = false
    for (let i = index; i < num.length; ++i) {
      if (num.charAt(i) === '.') {
        continue
      }
      if (Number(num.charAt(i)) >= 5) {
        shouldRoundUp = true
        break
      }
    }
    for (let i = index - 1; shouldRoundUp && i >= 0; --i) {
      let char = num.charAt(i)
      if (char === '.') {
        continue
      }
      if (char === '9') {
        char = '0'
      } else {
        char = (Number(char) + 1).toString()
        shouldRoundUp = false
      }
      num = num.substring(0, index) + char + num.substring(index + char.length)
    }
  }
  return num.substring(0, index)
}
