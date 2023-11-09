"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = exports.WEI = exports.IEW = exports.BIG = exports.NUM = exports.STR = exports.formatMultiCallBignumber = exports.parseMultiCallResponse = exports.decodeERC1155TransferLog = exports.decodeERC20TransferLog = exports.num = exports.bn = void 0;
const ethers_1 = require("ethers");
const ERC20_json_1 = __importDefault(require("../abi/ERC20.json"));
const ERC1155_json_1 = __importDefault(require("../abi/ERC1155.json"));
const View_json_1 = __importDefault(require("../abi/View.json"));
const mdp = require('move-decimal-point');
exports.bn = ethers_1.BigNumber.from;
exports.num = Number;
const erc20Interface = new ethers_1.ethers.utils.Interface(ERC20_json_1.default);
const erc1155Interface = new ethers_1.ethers.utils.Interface(ERC1155_json_1.default);
const decodeERC20TransferLog = (log) => {
    const decodedLog = erc20Interface.parseLog(log);
    return {
        address: log.address,
        from: decodedLog.args.from,
        to: decodedLog.args.to,
        value: decodedLog.args.value,
    };
};
exports.decodeERC20TransferLog = decodeERC20TransferLog;
const decodeERC1155TransferLog = (log) => {
    const decodedLog = erc1155Interface.parseLog(log);
    return {
        address: log.address,
        from: decodedLog.args.from,
        to: decodedLog.args.to,
        operator: decodedLog.args.operator,
        id: decodedLog.args.id,
        value: decodedLog.args.value,
    };
};
exports.decodeERC1155TransferLog = decodeERC1155TransferLog;
const parseMultiCallResponse = (returnValues) => {
    if (returnValues.length === 0)
        return;
    const poolOverrideAbi = View_json_1.default.abi;
    const abiInterface = new ethers_1.ethers.utils.Interface(poolOverrideAbi);
    const data = (0, exports.formatMultiCallBignumber)(returnValues);
    const encodeData = abiInterface.encodeFunctionResult('compute', [data]);
    const formatedData = abiInterface.decodeFunctionResult('compute', encodeData);
    return {
        ...formatedData.stateView,
        ...formatedData.stateView.state,
    };
};
exports.parseMultiCallResponse = parseMultiCallResponse;
const formatMultiCallBignumber = (data) => {
    return data.map((item) => {
        if (item.type === 'BigNumber') {
            item = (0, exports.bn)(item.hex);
        }
        if (Array.isArray(item)) {
            item = (0, exports.formatMultiCallBignumber)(item);
        }
        return item;
    });
};
exports.formatMultiCallBignumber = formatMultiCallBignumber;
const STR = (num) => {
    if (!num) {
        return '0';
    }
    switch (typeof num) {
        case 'string':
            if (!num?.includes('e')) {
                return num;
            }
            num = Number(num);
        // eslint-disable-next-line no-fallthrough
        case 'number':
            if (!isFinite(num)) {
                return num > 0 ? '∞' : '-∞';
            }
            return num.toLocaleString(['en-US', 'fullwide'], { useGrouping: false });
        default:
            return String(num);
    }
};
exports.STR = STR;
const NUM = (num) => {
    if (!num) {
        return 0;
    }
    switch (typeof num) {
        case 'number':
            return num;
        case 'string':
            if (num === '∞') {
                return Number.POSITIVE_INFINITY;
            }
            if (num === '-∞') {
                return Number.NEGATIVE_INFINITY;
            }
            return Number.parseFloat(num);
        default:
            return num.toNumber();
    }
};
exports.NUM = NUM;
const BIG = (num) => {
    if (!num) {
        return ethers_1.BigNumber.from(0);
    }
    switch (typeof num) {
        case 'string':
            if (num?.includes('e')) {
                num = Number(num);
            }
        // eslint-disable-next-line no-fallthrough
        case 'number':
            return ethers_1.BigNumber.from(num || 0);
        default:
            return num;
    }
};
exports.BIG = BIG;
const IEW = (wei, decimals = 18, decimalsToDisplay) => {
    let num = mdp(String(wei), -decimals);
    if (decimalsToDisplay != null) {
        num = (0, exports.truncate)(num, decimalsToDisplay);
    }
    return num;
};
exports.IEW = IEW;
const WEI = (num, decimals = 18) => {
    return (0, exports.truncate)(mdp((0, exports.STR)(num), decimals));
};
exports.WEI = WEI;
const truncate = (num, decimals = 0, rounding = false) => {
    let index = Math.max(num.lastIndexOf('.'), num.lastIndexOf(','));
    if (index < 0) {
        index = num.length;
    }
    index += decimals + (decimals > 0 ? 1 : 0);
    if (rounding) {
        let shouldRoundUp = false;
        for (let i = index; i < num.length; ++i) {
            if (num.charAt(i) === '.') {
                continue;
            }
            if (Number(num.charAt(i)) >= 5) {
                shouldRoundUp = true;
                break;
            }
        }
        for (let i = index - 1; shouldRoundUp && i >= 0; --i) {
            let char = num.charAt(i);
            if (char === '.') {
                continue;
            }
            if (char === '9') {
                char = '0';
            }
            else {
                char = (Number(char) + 1).toString();
                shouldRoundUp = false;
            }
            num = num.substring(0, index) + char + num.substring(index + char.length);
        }
    }
    return num.substring(0, index);
};
exports.truncate = truncate;
//# sourceMappingURL=utils.js.map