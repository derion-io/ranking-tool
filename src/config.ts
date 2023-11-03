import type { INetworkConfig } from './types'

export const DDL_CONFIGS_URL = {
  development: 'https://raw.githubusercontent.com/derivable-labs/configs/dev/',
  production: 'https://raw.githubusercontent.com/derivable-labs/configs/main/',
}
export const CHAIN_ID = 56

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
