import type { INetworkConfig } from './types';
export declare const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export declare const PLD_ADDRESS = "0xBa95100a0c3abaD1e10414Be77347D3D0900D8c2";
export declare const POSITION_ADDRESS = "0x0819281c74bed5423c1b3283808f8e26aad18dbe";
export declare const Z2_ADDRESS = "0xc3E15702653704b8afc3A1dA39314CB3FE8B8A5D";
export declare const ACCEPT_ADDERSSES: string[];
export declare const CHAIN_ID = 56;
export declare const POOL_IDS: {
    cToken: number;
    cp: number;
    token0: number;
    token1: number;
    native: number;
    R: number;
    A: number;
    B: number;
    C: number;
};
export declare const DDL_CONFIGS_URL: {
    development: string;
    production: string;
};
export declare const loadConfig: (chainId: number) => Promise<{
    networkConfig: INetworkConfig;
    uniV3Pools: any;
}>;
