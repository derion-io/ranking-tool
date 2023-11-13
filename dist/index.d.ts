import { IPoolsSpot } from './types';
export declare const getRank: (getLogsInprogressCallBack?: ((fromBlock: number, toBlock: number) => void) | undefined, getLogsCallBack?: ((logsLength: number) => void) | undefined, getPriceInprogressCallBack?: ((pool: string[]) => void) | undefined, getPricesCallBack?: ((poolsSpot: IPoolsSpot) => void) | undefined, participationsCallback?: ((wallets: string[], illegalWallets: {
    address: String;
    reason: String;
    txHash: String;
}[]) => void) | undefined, computeInprogressCallBack?: ((computes: string[]) => void) | undefined, computeCallBack?: ((computesValue: string[]) => void) | undefined) => Promise<{
    results: {
        address: string;
        balance: string;
    }[];
    illegalParticipations: {
        address: String;
        reason: String;
        txHash: String;
    }[];
}>;
