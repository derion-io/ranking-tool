import { IPool, IPoolsConfig, IPriceInfo } from '../types'
import TokenInfo from '../abi/TokensInfo.json'
import View from '../abi/View.json'
import { bn } from '../utils/utils'
import { BigNumber } from 'ethers'
import { ContractCallContext } from 'ethereum-multicall'
import univ2 from '../abi/UniV2Pair.json'
import univ3 from '../abi/UniV3Pair.json'
export const getMultiCallConfig = (poolsAddress: string[]): ContractCallContext[] => {
  const request: ContractCallContext[] = []
  poolsAddress.map((poolAddress, _) => {
    request.push({
      reference: poolAddress,
      contractAddress: poolAddress,
      abi: View.abi,
      calls: [
        {
          reference: _.toString(),
          methodName: 'loadConfig',
          methodParameters: [],
        },
      ],
    })
  })
  return request
}

export const getMultiCallPrice = (poolsConfigs: IPoolsConfig): ContractCallContext[] => {
  const request: ContractCallContext[] = []
  Object.keys(poolsConfigs).map((poolAddress, _) => {
    const { oracle, type } = poolsConfigs[poolAddress]
    if (type === 'uni2')
      request.push({
        reference: poolAddress,
        contractAddress: oracle,
        abi: univ2,
        calls: [
          {
            reference: _.toString(),
            methodName: 'getReserves',
            methodParameters: [],
          },
        ],
      })
    else if (type === 'uni3') {
      request.push({
        reference: poolAddress,
        contractAddress: oracle,
        abi: univ3,
        calls: [
          {
            reference: _.toString(),
            methodName: 'slot0',
            methodParameters: [],
          },
        ],
      })
    }
  })
  //   console.log(request)
  return request
}
