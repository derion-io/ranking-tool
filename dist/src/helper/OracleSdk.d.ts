import { EthGetBlockByNumber, EthGetProof, EthGetStorageAt, Proof } from '../types';
export declare function addressToString(value: bigint): string;
export declare function getPrice(ethGetStorageAt: EthGetStorageAt, ethGetBlockByNumber: EthGetBlockByNumber, exchangeAddress: bigint, quoteTokenIndex: number, blockNumber: bigint): Promise<bigint>;
export declare function getAccumulatorPrice(ethGetStorageAt: EthGetStorageAt, exchangeAddress: bigint, quoteTokenIndex: number, blockNumber: bigint): Promise<{
    price: bigint;
    timestamp: bigint;
}>;
export declare function getProof(ethGetProof: EthGetProof, ethGetBlockByNumber: EthGetBlockByNumber, exchangeAddress: bigint, quoteTokenIndex: number, blockNumber: bigint): Promise<Proof>;
export declare function unsignedIntegerToUint8Array(value: bigint | number, widthInBytes?: 8 | 20 | 32 | 256): Uint8Array;
export declare function stripLeadingZeros(byteArray: Uint8Array): Uint8Array;
