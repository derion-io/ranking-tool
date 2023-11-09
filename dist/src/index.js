"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRank = void 0;
const ethereum_multicall_1 = require("ethereum-multicall");
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const logs_json_1 = __importDefault(require("../logs.json"));
const config_1 = require("./config");
const resource_1 = require("./helper/resource");
const rpc_1 = require("./helper/rpc");
const utils_1 = require("./utils/utils");
const ERC20_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const ERC1155_TRANSFER_TOPIC = '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';
const getRank = async () => {
    const { networkConfig, uniV3Pools } = await (0, config_1.loadConfig)(config_1.CHAIN_ID);
    const provider = (0, rpc_1.getRPC)(networkConfig);
    const currentBlock = 39305800;
    let logs = logs_json_1.default || [];
    if (logs_json_1.default.length === 0) {
        logs = await provider.getLogs({
            fromBlock: 0,
            toBlock: currentBlock,
            address: [config_1.PLD_ADDRESS, config_1.POSITION_ADDRESS],
            topics: [[ERC20_TRANSFER_TOPIC, ERC1155_TRANSFER_TOPIC]],
        });
        const jsonData = JSON.stringify(logs, null, 2);
        const filePath = 'logs.json';
        fs_1.default.writeFileSync(filePath, jsonData);
    }
    const erc20Balance = {};
    const logGroups = logs.reduce((result, log) => {
        if (!result[log.transactionHash]) {
            result[log.transactionHash] = [];
        }
        if (log.topics[0] === ERC20_TRANSFER_TOPIC) {
            const dLog = (0, utils_1.decodeERC20TransferLog)(log);
            if (!erc20Balance[dLog.from])
                erc20Balance[dLog.from] = (0, utils_1.bn)(0);
            if (!erc20Balance[dLog.to])
                erc20Balance[dLog.to] = (0, utils_1.bn)(0);
            erc20Balance[dLog.from] = erc20Balance[dLog.from].sub(dLog.value);
            erc20Balance[dLog.to] = erc20Balance[dLog.to].add(dLog.value);
        }
        result[log.transactionHash].push(log);
        return result;
    }, {});
    const participations = [];
    const illegalParticipations = [];
    const participationsBalance = {};
    Object.keys(logGroups).map((key) => {
        const logGroup = logGroups[key];
        if (logGroup.length === 1 && logGroup[0].topics[0] === ERC20_TRANSFER_TOPIC) {
            const dLog = (0, utils_1.decodeERC20TransferLog)(logGroups[key][0]);
            const pIndex = participations.findIndex((p) => p === dLog.to);
            if (pIndex !== -1) {
                illegalParticipations.push({
                    address: dLog.to,
                    reason: 'Multi transfer from Z2',
                    txHash: key,
                });
                participations.splice(pIndex, 1);
                // }
            }
            else if ((0, utils_1.num)((0, utils_1.bn)(dLog.value)) > 500000000000000000000) {
                illegalParticipations.push({
                    address: dLog.to,
                    reason: 'Recieved > 500 PLD',
                    txHash: key,
                });
            }
            else if (dLog.from !== config_1.Z2_ADDRESS) {
                illegalParticipations.push({
                    address: dLog.to,
                    reason: 'Transfer not from Z2',
                    txHash: key,
                });
            }
            else {
                participations.push(dLog.to);
            }
        }
        else {
            logGroups[key].map((log) => {
                if (log.topics[0] !== ERC1155_TRANSFER_TOPIC)
                    return;
                const { from, to, id, value } = (0, utils_1.decodeERC1155TransferLog)(log);
                const side = '0x' + id._hex.slice(2, 4);
                const poolAddress = '0x' + id._hex.slice(4);
                const paths = [from, to];
                paths.forEach((path) => {
                    if (!participationsBalance[path]) {
                        participationsBalance[path] = {};
                    }
                    if (!participationsBalance[path][poolAddress]) {
                        participationsBalance[path][poolAddress] = {};
                    }
                    if (!participationsBalance[path][poolAddress][side]) {
                        participationsBalance[path][poolAddress][side] = (0, utils_1.bn)(0);
                    }
                });
                participationsBalance[from][poolAddress][side] = participationsBalance[from][poolAddress][side].sub(value);
                participationsBalance[to][poolAddress][side] = participationsBalance[to][poolAddress][side].add(value);
            });
        }
    });
    // console.log(participationsBalance['0xd5277a33d1109842128852854176e321e663578d'])
    const multicall = new ethereum_multicall_1.Multicall({
        multicallCustomContractAddress: networkConfig.helperContract.multiCall,
        ethersProvider: provider,
        tryAggregate: true,
    });
    // 0xd5277A33d1109842128852854176E321e663578d
    // console.log(participations)
    // console.log(illegalParticipations)
    // provider.setStateOverride({})
    let poolsAddress = [];
    Object.keys(participationsBalance).map((pa) => {
        if (participations.includes(pa) || pa === config_1.ZERO_ADDRESS)
            return;
        Object.keys(participationsBalance[pa]).map((poolKey) => {
            poolsAddress.push(poolKey);
        });
    });
    poolsAddress = (0, lodash_1.uniq)(poolsAddress);
    const [{ results }] = await Promise.all([multicall.call((0, resource_1.getMultiCallConfig)(poolsAddress))]);
    const poolConfigs = {};
    Object.keys(results).map((key) => {
        const { callsReturnContext } = results[key];
        const returnValues = callsReturnContext[0].returnValues;
        if (!callsReturnContext[0].success || returnValues[2] !== config_1.PLD_ADDRESS)
            return;
        poolConfigs[key] = {
            fetcher: returnValues[0],
            oracle: '0x' + returnValues[1].slice(returnValues[1].length - 40, returnValues[1].length),
            type: networkConfig.fetchers && networkConfig.fetchers[returnValues[0]]?.type.includes('3') ? 'uni3' : 'uni2',
            QTI: returnValues[1][2] === '0' ? 0 : 1,
        };
    });
    const [{ results: rawPrices }] = await Promise.all([multicall.call((0, resource_1.getMultiCallPrice)(poolConfigs))]);
    const poolsSpot = {};
    Object.keys(rawPrices).map((key) => {
        const { callsReturnContext } = rawPrices[key];
        const returnValues = callsReturnContext[0].returnValues;
        if (returnValues.length <= 3) {
            const [r0, r1] = returnValues;
            const [rq, rb] = poolConfigs[key].QTI === 0 ? [(0, utils_1.bn)(r0), (0, utils_1.bn)(r1)] : [(0, utils_1.bn)(r1), (0, utils_1.bn)(r0)];
            const spot = rq.shl(128).div(rb);
            poolsSpot[poolConfigs[key].oracle] = spot;
        }
        else {
            const sqrtPriceX96 = (0, utils_1.bn)(returnValues[0]);
            let spot = sqrtPriceX96.shl(32);
            spot = spot.mul(spot).shr(128);
            poolsSpot[poolConfigs[key].oracle] = spot;
        }
    });
    const [{ results: rawPoolCompute }] = await Promise.all([multicall.call((0, resource_1.getMultiCallCompute)(poolConfigs, poolsSpot))]);
    const poolComputes = {};
    Object.keys(rawPoolCompute).map((key) => {
        const { callsReturnContext } = rawPoolCompute?.[key];
        const returnValues = callsReturnContext[0].returnValues;
        const parseData = (0, utils_1.parseMultiCallResponse)(returnValues);
        if (!parseData)
            return;
        const { rA, rB, rC, sA, sB, sC } = (0, utils_1.parseMultiCallResponse)(returnValues);
        poolComputes[key.toLowerCase()] = { rA, rB, rC, sA, sB, sC };
    });
    const participationsValue = {};
    participations.map((pa) => {
        if (!participationsBalance[pa])
            return;
        if (!participationsValue[pa])
            participationsValue[pa] = erc20Balance[pa] || (0, utils_1.bn)(0);
        Object.keys(participationsBalance[pa]).map((poolKey) => {
            if (!poolComputes[poolKey])
                return;
            Object.keys(participationsBalance[pa][poolKey]).map((side) => {
                const rX = Number(side) === config_1.POOL_IDS.A
                    ? poolComputes[poolKey].rA
                    : Number(side) === config_1.POOL_IDS.B
                        ? poolComputes[poolKey].rB
                        : poolComputes[poolKey].rC;
                const sX = Number(side) === config_1.POOL_IDS.A
                    ? poolComputes[poolKey].sA
                    : Number(side) === config_1.POOL_IDS.B
                        ? poolComputes[poolKey].sB
                        : poolComputes[poolKey].sC;
                const value = participationsBalance[pa][poolKey][side].mul(rX).div(sX);
                participationsValue[pa] = participationsValue[pa].add(value);
            });
        });
    });
    const arraya = [];
    Object.keys(participationsValue).map((key) => {
        arraya.push({
            address: key,
            balance: (0, utils_1.IEW)(participationsValue[key]),
        });
    });
    arraya.sort((a, b) => (0, utils_1.num)(b.balance) - (0, utils_1.num)(a.balance));
    console.log(arraya);
    return arraya;
};
exports.getRank = getRank;
// 0xd1f294227ed930993098914e829a176b6b1905d2
// 0x03342265f292ac143f9c79dfee076332ae05769e
// 0xd030eff6bcffcd4ef745450a16993ddac3eaf24a
// 0x5fb0ce35c384434c7a905f430326d1135b6857c8
// 0x446fed921f27fb001766cd4ac66ab866a22234eb
//# sourceMappingURL=index.js.map