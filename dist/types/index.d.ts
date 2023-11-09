import { BigNumber } from 'ethers';
export interface INetworkConfig {
    chainId: number;
    rpc: string;
    rpcGetLog?: string;
    rpcGetProof?: string;
    scanApi?: string;
    explorer?: string;
    scanName?: string;
    timePerBlock: number;
    candleChartApi?: string;
    storage?: Storage;
    gasLimitDefault: number;
    gasForProof: number;
    name: string;
    nativeSymbol: string;
    wrappedTokenAddress: string;
    nativePriceUSD: number;
    stablecoins: string[];
    tokens?: {
        [address: string]: {
            price?: number;
            symbol: string;
            name: string;
            decimals: number;
            logo: string;
        };
    };
    fetchers?: {
        [address: string]: {
            type: string;
            factory: string[];
        };
    };
    helperContract: IHelperContract;
    uniswap: IUniswapContractAddress;
    derivable: IDerivableContractAddress;
}
export interface IHelperContract {
    utr: string;
    multiCall: string;
}
export interface IUniswapContractAddress {
    v3Factory: string;
}
export interface IDerivableContractAddress {
    version: number;
    startBlock: number;
    poolFactory: string;
    logic: string;
    token: string;
    stateCalHelper: string;
    feeReceiver: string;
    tokenDescriptor: string;
    compositeFetcher: string;
    multiCall: string;
    uniswapV2Fetcher?: string;
}
export interface ILog {
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    blockHash: string;
    timeStamp: string;
    gasPrice: string;
    gasUsed: string;
    logIndex: number;
    transactionHash: string;
    transactionIndex: number;
}
export type TokenType = {
    address: string;
    decimal: number;
    name: string;
    symbol: string;
    icon?: string;
};
export type StatesType = {
    R: BigNumber;
    a: BigNumber;
    b: BigNumber;
    rA: BigNumber;
    rB: BigNumber;
    rC: BigNumber;
    sA: BigNumber;
    sB: BigNumber;
    sC: BigNumber;
    twap: BigNumber;
    spot: BigNumber;
    state: {
        R: BigNumber;
        a: BigNumber;
        b: BigNumber;
    };
    config: any;
};
export type IPool = {
    UTR: string;
    TOKEN: string;
    MARK: BigNumber;
    INIT_TIME: BigNumber;
    INTEREST_HL: BigNumber;
    HALF_LIFE: BigNumber;
    PREMIUM_HL: BigNumber;
    ORACLE: string;
    TOKEN_R: string;
    FETCHER: string;
    pool: string;
    logic: string;
    k: BigNumber;
    cTokenPrice: number;
    baseSymbol: string;
    states: StatesType;
    baseToken: string;
    quoteToken: string;
    cToken: string;
    powers: number[];
    dTokens: string[];
    priceToleranceRatio: BigNumber;
    quoteSymbol: string;
    rentRate: BigNumber;
    deleverageRate: BigNumber;
    poolAddress: string;
    quoteId: number;
    baseId: number;
    basePrice: string;
    cPrice: number;
    pair: string;
    quoteTokenIndex: number;
    window: BigNumber;
};
export type IPriceInfo = {
    [pool: string]: {
        twap: BigNumber;
        spot: BigNumber;
    };
};
export type IPoolsConfig = {
    [pool: string]: {
        fetcher: string;
        oracle: string;
        type: 'uni2' | 'uni3';
        QTI: 0 | 1;
    };
};
export interface Proof {
    readonly block: Uint8Array;
    readonly accountProofNodesRlp: Uint8Array;
    readonly reserveAndTimestampProofNodesRlp: Uint8Array;
    readonly priceAccumulatorProofNodesRlp: Uint8Array;
}
export type ProofResult = {
    readonly accountProof: readonly Uint8Array[];
    readonly storageProof: readonly {
        readonly key: bigint;
        readonly value: bigint;
        readonly proof: readonly Uint8Array[];
    }[];
};
export type Block = {
    readonly parentHash: bigint;
    readonly sha3Uncles: bigint;
    readonly miner: bigint;
    readonly stateRoot: bigint;
    readonly transactionsRoot: bigint;
    readonly receiptsRoot: bigint;
    readonly logsBloom: bigint;
    readonly difficulty: bigint;
    readonly number: bigint;
    readonly gasLimit: bigint;
    readonly gasUsed: bigint;
    readonly timestamp: bigint;
    readonly extraData: Uint8Array;
    readonly mixHash: bigint | undefined;
    readonly nonce: bigint | null;
    readonly baseFeePerGas: bigint | null;
};
export type EthGetStorageAt = (address: bigint, position: bigint, block: bigint | 'latest') => Promise<bigint>;
export type EthGetProof = (address: bigint, positions: readonly bigint[], block: bigint) => Promise<ProofResult>;
export type EthGetBlockByNumber = (blockNumber: bigint | 'latest') => Promise<Block | null>;
export type IPoolsSpot = {
    [pool: string]: BigNumber;
};
export type IPoolsCompute = {
    [pool: string]: {
        rA: BigNumber;
        rB: BigNumber;
        rC: BigNumber;
        sA: BigNumber;
        sB: BigNumber;
        sC: BigNumber;
    };
};
export type IPoolsType = {
    [key: string]: IPool;
};
