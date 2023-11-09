export declare const getRank: (getLogsInprogressCallBack?: ((fromBlock: number, toBlock: number) => void) | undefined, getLogsCallBack?: ((logsLength: number) => void) | undefined, participationsCallback?: ((wallets: string[], illegalWallets: {
    address: String;
    reason: String;
    txHash: String;
}[]) => void) | undefined, computeCallBack?: () => void) => Promise<{
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
