import { BigNumber } from 'ethers';
import { ILog } from '../types';
export declare const bn: typeof BigNumber.from;
export declare const num: NumberConstructor;
export declare const decodeERC20TransferLog: (log: ILog) => {
    address: string;
    from: string;
    to: string;
    value: BigNumber;
};
export declare const decodeERC1155TransferLog: (log: ILog) => {
    address: string;
    from: string;
    to: string;
    operator: string;
    id: BigNumber;
    value: BigNumber;
};
export declare const parseMultiCallResponse: (returnValues: any[]) => any;
export declare const formatMultiCallBignumber: (data: any) => any;
export declare const STR: (num: number | string | BigNumber) => string;
export declare const NUM: (num: number | string | BigNumber) => number;
export declare const BIG: (num: number | string | BigNumber) => BigNumber;
export declare const IEW: (wei: BigNumber | string, decimals?: number, decimalsToDisplay?: number) => string;
export declare const WEI: (num: number | string, decimals?: number) => string;
export declare const truncate: (num: string, decimals?: number, rounding?: boolean) => string;
