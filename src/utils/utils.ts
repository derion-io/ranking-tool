import { BigNumber, ethers } from 'ethers'
import erc20 from '../abi/ERC20.json'
import erc1155 from '../abi/ERC1155.json'
import { ILog } from '../types'
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
