import type { INetworkConfig } from './types'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const PLD_ADDRESS = '0xBa95100a0c3abaD1e10414Be77347D3D0900D8c2'
export const POSITION_ADDRESS = '0x0819281c74bed5423c1b3283808f8e26aad18dbe'
export const Z2_ADDRESS = '0xc3E15702653704b8afc3A1dA39314CB3FE8B8A5D'
export const ACCEPT_ADDERSSES = ['0x8Bd6072372189A12A2889a56b6ec982fD02b0B87', '0x8Bd6072372189A12A2889a56b6ec982fD02b0B87']
export const CHAIN_ID = 56

export const POOL_IDS = {
  cToken: 131072,
  cp: 65536,
  token0: 262144,
  token1: 262145,
  native: 0x01,
  R: 0x00,
  A: 0x10,
  B: 0x20,
  C: 0x30,
}

export const DDL_CONFIGS_URL = {
  development: 'https://raw.githubusercontent.com/derivable-labs/configs/dev/',
  production: 'https://raw.githubusercontent.com/derivable-labs/configs/main/',
}

export const loadConfig = async (chainId: number): Promise<{ networkConfig: INetworkConfig; uniV3Pools: any }> => {
  const env = 'development'
  const [networkConfig, uniV3Pools] = await Promise.all([
    fetch(DDL_CONFIGS_URL[env] + chainId + '/network.json').then((r) => r.json()),
    fetch(DDL_CONFIGS_URL[env] + chainId + '/routes.json')
      .then((r) => r.json())
      .catch(() => []),
  ])
  return { networkConfig, uniV3Pools }
}
