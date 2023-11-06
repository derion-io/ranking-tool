import { BigNumber } from 'ethers'

export interface INetworkConfig {
  chainId: number
  rpc: string
  rpcGetLog?: string
  rpcGetProof?: string
  scanApi?: string
  explorer?: string
  scanName?: string
  timePerBlock: number
  candleChartApi?: string
  storage?: Storage
  gasLimitDefault: number
  gasForProof: number
  name: string
  nativeSymbol: string
  wrappedTokenAddress: string
  nativePriceUSD: number
  stablecoins: string[]
  tokens?: { [address: string]: { price?: number; symbol: string; name: string; decimals: number; logo: string } }
  helperContract: IHelperContract
  uniswap: IUniswapContractAddress
  derivable: IDerivableContractAddress
}

export interface IHelperContract {
  utr: string
  multiCall: string
}

export interface IUniswapContractAddress {
  v3Factory: string
}

export interface IDerivableContractAddress {
  version: number
  startBlock: number
  poolFactory: string
  logic: string
  token: string
  stateCalHelper: string
  feeReceiver: string
  tokenDescriptor: string
  compositeFetcher: string
  multiCall: string
  uniswapV2Fetcher?: string
}

export interface ILog {
  address: string
  topics: string[]
  data: string
  blockNumber: number
  blockHash: string
  timeStamp: string
  gasPrice: string
  gasUsed: string
  logIndex: number
  transactionHash: string
  transactionIndex: number
}

export type TokenType = {
  address: string
  decimal: number
  name: string
  symbol: string
  icon?: string
}

export type StatesType = {
  R: BigNumber
  a: BigNumber
  b: BigNumber
  rA: BigNumber
  rB: BigNumber
  rC: BigNumber
  sA: BigNumber
  sB: BigNumber
  sC: BigNumber
  twap: BigNumber
  spot: BigNumber
  state: {
    R: BigNumber
    a: BigNumber
    b: BigNumber
  }
  config: any
}

export type PoolType = {
  UTR: string
  TOKEN: string
  MARK: BigNumber
  INIT_TIME: BigNumber
  INTEREST_HL: BigNumber
  HALF_LIFE: BigNumber
  PREMIUM_HL: BigNumber
  ORACLE: string
  TOKEN_R: string
  FETCHER: string
  pool: string
  logic: string
  k: BigNumber
  cTokenPrice: number
  baseSymbol: string
  states: StatesType
  baseToken: string
  quoteToken: string
  cToken: string
  powers: number[]
  dTokens: string[]
  priceToleranceRatio: BigNumber
  quoteSymbol: string
  rentRate: BigNumber
  deleverageRate: BigNumber
  poolAddress: string
  quoteId: number
  baseId: number
  basePrice: string
  cPrice: number
  pair: string
  quoteTokenIndex: number
  window: BigNumber
}

export type PoolsType = { [key: string]: PoolType }
