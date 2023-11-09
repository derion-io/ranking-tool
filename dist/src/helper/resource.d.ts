import { IPoolsConfig, IPoolsSpot } from '../types';
import { ContractCallContext } from 'ethereum-multicall';
export declare const getMultiCallConfig: (poolsAddress: string[]) => ContractCallContext[];
export declare const getMultiCallPrice: (poolsConfigs: IPoolsConfig) => ContractCallContext[];
export declare const getMultiCallCompute: (poolConfigs: IPoolsConfig, poolsSpots: IPoolsSpot, derivableToken?: string) => ContractCallContext[];
