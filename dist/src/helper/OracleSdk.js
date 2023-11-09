"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripLeadingZeros = exports.unsignedIntegerToUint8Array = exports.getProof = exports.getAccumulatorPrice = exports.getPrice = exports.addressToString = void 0;
const rlp_encoder_1 = require("@zoltu/rlp-encoder");
function addressToString(value) {
    return `0x${value.toString(16).padStart(40, '0')}`;
}
exports.addressToString = addressToString;
async function getPrice(ethGetStorageAt, ethGetBlockByNumber, exchangeAddress, quoteTokenIndex, blockNumber) {
    async function getAccumulatorValue(innerBlockNumber, timestamp) {
        const priceAccumulatorSlot = quoteTokenIndex == 0 ? 10n : 9n;
        const [reservesAndTimestamp, accumulator] = await Promise.all([
            ethGetStorageAt(exchangeAddress, 8n, innerBlockNumber),
            ethGetStorageAt(exchangeAddress, priceAccumulatorSlot, innerBlockNumber),
        ]);
        const blockTimestampLast = reservesAndTimestamp >> (112n + 112n);
        const reserve1 = (reservesAndTimestamp >> 112n) & (2n ** 112n - 1n);
        const reserve0 = reservesAndTimestamp & (2n ** 112n - 1n);
        // if (token0 !== denominationToken && token1 !== denominationToken) throw new Error(`Denomination token ${addressToString(denominationToken)} is not one of the tokens for exchange ${exchangeAddress}`)
        if (reserve0 === 0n)
            throw new Error(`Exchange ${addressToString(exchangeAddress)} does not have any reserves for token0.`);
        if (reserve1 === 0n)
            throw new Error(`Exchange ${addressToString(exchangeAddress)} does not have any reserves for token1.`);
        if (blockTimestampLast === 0n)
            throw new Error(`Exchange ${addressToString(exchangeAddress)} has not had its first accumulator update (or it is year 2106).`);
        if (accumulator === 0n)
            throw new Error(`Exchange ${addressToString(exchangeAddress)} has not had its first accumulator update (or it is 136 years since launch).`);
        const numeratorReserve = quoteTokenIndex === 0 ? reserve0 : reserve1;
        const denominatorReserve = quoteTokenIndex === 0 ? reserve1 : reserve0;
        const timeElapsedSinceLastAccumulatorUpdate = timestamp - blockTimestampLast;
        const priceNow = (numeratorReserve * 2n ** 112n) / denominatorReserve;
        return accumulator + timeElapsedSinceLastAccumulatorUpdate * priceNow;
    }
    const latestBlock = {
        timestamp: BigInt(Math.floor(new Date().getTime() / 1000)),
    };
    const historicBlock = await ethGetBlockByNumber(blockNumber);
    if (historicBlock === null)
        throw new Error(`Block ${blockNumber} does not exist.`);
    const [latestAccumulator, historicAccumulator] = await Promise.all([
        getAccumulatorValue('latest', latestBlock.timestamp),
        getAccumulatorValue(blockNumber, historicBlock.timestamp),
    ]);
    const accumulatorDelta = latestAccumulator - historicAccumulator;
    const timeDelta = latestBlock.timestamp - historicBlock.timestamp;
    return timeDelta === 0n ? accumulatorDelta : accumulatorDelta / timeDelta;
}
exports.getPrice = getPrice;
async function getAccumulatorPrice(
// eslint-disable-next-line camelcase
ethGetStorageAt, exchangeAddress, quoteTokenIndex, blockNumber) {
    const priceAccumulatorSlot = quoteTokenIndex === 0 ? 10n : 9n;
    const [reservesAndTimestamp, accumulator] = await Promise.all([
        ethGetStorageAt(exchangeAddress, 8n, blockNumber),
        ethGetStorageAt(exchangeAddress, priceAccumulatorSlot, blockNumber),
    ]);
    const blockTimestampLast = reservesAndTimestamp >> (112n + 112n);
    const reserve1 = (reservesAndTimestamp >> 112n) & (2n ** 112n - 1n);
    const reserve0 = reservesAndTimestamp & (2n ** 112n - 1n);
    if (reserve0 === 0n)
        throw new Error(`Exchange ${addressToString(exchangeAddress)} does not have any reserves for token0.`);
    if (reserve1 === 0n)
        throw new Error(`Exchange ${addressToString(exchangeAddress)} does not have any reserves for token1.`);
    if (blockTimestampLast === 0n)
        throw new Error(`Exchange ${addressToString(exchangeAddress)} has not had its first accumulator update (or it is year 2106).`);
    if (accumulator === 0n)
        throw new Error(`Exchange ${addressToString(exchangeAddress)} has not had its first accumulator update (or it is 136 years since launch).`);
    return {
        price: accumulator,
        timestamp: blockTimestampLast,
    };
}
exports.getAccumulatorPrice = getAccumulatorPrice;
async function getProof(ethGetProof, ethGetBlockByNumber, exchangeAddress, quoteTokenIndex, blockNumber) {
    const priceAccumulatorSlot = quoteTokenIndex === 0 ? 10n : 9n;
    const [block, proof] = await Promise.all([
        ethGetBlockByNumber(blockNumber),
        ethGetProof(exchangeAddress, [8n, priceAccumulatorSlot], blockNumber),
    ]);
    if (block === null)
        throw new Error(`Received null for block ${Number(blockNumber)}`);
    const blockRlp = rlpEncodeBlock(block);
    const accountProofNodesRlp = (0, rlp_encoder_1.rlpEncode)(proof.accountProof.map(rlp_encoder_1.rlpDecode));
    const reserveAndTimestampProofNodesRlp = (0, rlp_encoder_1.rlpEncode)(proof.storageProof[0].proof.map(rlp_encoder_1.rlpDecode));
    const priceAccumulatorProofNodesRlp = (0, rlp_encoder_1.rlpEncode)(proof.storageProof[1].proof.map(rlp_encoder_1.rlpDecode));
    return {
        block: blockRlp,
        accountProofNodesRlp,
        reserveAndTimestampProofNodesRlp,
        priceAccumulatorProofNodesRlp,
    };
}
exports.getProof = getProof;
function rlpEncodeBlock(block) {
    return (0, rlp_encoder_1.rlpEncode)([
        unsignedIntegerToUint8Array(block.parentHash, 32),
        unsignedIntegerToUint8Array(block.sha3Uncles, 32),
        unsignedIntegerToUint8Array(block.miner, 20),
        unsignedIntegerToUint8Array(block.stateRoot, 32),
        unsignedIntegerToUint8Array(block.transactionsRoot, 32),
        unsignedIntegerToUint8Array(block.receiptsRoot, 32),
        unsignedIntegerToUint8Array(block.logsBloom, 256),
        stripLeadingZeros(unsignedIntegerToUint8Array(block.difficulty, 32)),
        stripLeadingZeros(unsignedIntegerToUint8Array(block.number, 32)),
        stripLeadingZeros(unsignedIntegerToUint8Array(block.gasLimit, 32)),
        stripLeadingZeros(unsignedIntegerToUint8Array(block.gasUsed, 32)),
        stripLeadingZeros(unsignedIntegerToUint8Array(block.timestamp, 32)),
        stripLeadingZeros(block.extraData),
        ...(block.mixHash != null ? [unsignedIntegerToUint8Array(block.mixHash, 32)] : []),
        ...(block.nonce != null ? [unsignedIntegerToUint8Array(block.nonce, 8)] : []),
        ...(block.baseFeePerGas != null ? [stripLeadingZeros(unsignedIntegerToUint8Array(block.baseFeePerGas, 32))] : []),
    ]);
}
function unsignedIntegerToUint8Array(value, widthInBytes = 32) {
    if (typeof value === 'number') {
        if (!Number.isSafeInteger(value))
            throw new Error(`${value} is not able to safely be cast into a bigint.`);
        value = BigInt(value);
    }
    if (value >= 2n ** (BigInt(widthInBytes) * 8n) || value < 0n)
        throw new Error(`Cannot fit ${value} into a ${widthInBytes * 8}-bit unsigned integer.`);
    const result = new Uint8Array(widthInBytes);
    if (result.length !== widthInBytes)
        throw new Error(`Cannot a ${widthInBytes} value into a ${result.length} byte array.`);
    for (let i = 0; i < result.length; ++i) {
        result[i] = Number((value >> BigInt((widthInBytes - i) * 8 - 8)) & 0xffn);
    }
    return result;
}
exports.unsignedIntegerToUint8Array = unsignedIntegerToUint8Array;
function stripLeadingZeros(byteArray) {
    let i = 0;
    for (; i < byteArray.length; ++i) {
        if (byteArray[i] !== 0)
            break;
    }
    const result = new Uint8Array(byteArray.length - i);
    for (let j = 0; j < result.length; ++j) {
        result[j] = byteArray[i + j];
    }
    return result;
}
exports.stripLeadingZeros = stripLeadingZeros;
//# sourceMappingURL=OracleSdk.js.map