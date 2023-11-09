"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultiCallCompute = exports.getMultiCallPrice = exports.getMultiCallConfig = void 0;
const View_json_1 = __importDefault(require("../abi/View.json"));
const utils_1 = require("../utils/utils");
const UniV2Pair_json_1 = __importDefault(require("../abi/UniV2Pair.json"));
const UniV3Pair_json_1 = __importDefault(require("../abi/UniV3Pair.json"));
const getMultiCallConfig = (poolsAddress) => {
    const request = [];
    poolsAddress.map((poolAddress, _) => {
        request.push({
            reference: poolAddress,
            contractAddress: poolAddress,
            abi: View_json_1.default.abi,
            calls: [
                {
                    reference: _.toString(),
                    methodName: 'loadConfig',
                    methodParameters: [],
                },
            ],
        });
    });
    return request;
};
exports.getMultiCallConfig = getMultiCallConfig;
const getMultiCallPrice = (poolsConfigs) => {
    const request = [];
    Object.keys(poolsConfigs).map((poolAddress, _) => {
        const { oracle, type } = poolsConfigs[poolAddress];
        if (type === 'uni2')
            request.push({
                reference: poolAddress,
                contractAddress: oracle,
                abi: UniV2Pair_json_1.default,
                calls: [
                    {
                        reference: _.toString(),
                        methodName: 'getReserves',
                        methodParameters: [],
                    },
                ],
            });
        else if (type === 'uni3') {
            request.push({
                reference: poolAddress,
                contractAddress: oracle,
                abi: UniV3Pair_json_1.default,
                calls: [
                    {
                        reference: _.toString(),
                        methodName: 'slot0',
                        methodParameters: [],
                    },
                ],
            });
        }
    });
    //   console.log(request)
    return request;
};
exports.getMultiCallPrice = getMultiCallPrice;
const getMultiCallCompute = (poolConfigs, poolsSpots, derivableToken = '0x0819281c74BeD5423C1B3283808F8E26AAd18DBe') => {
    const request = [];
    Object.keys(poolConfigs).map((poolAddress, _) => {
        request.push({
            reference: poolAddress,
            contractAddress: poolAddress,
            abi: View_json_1.default.abi,
            calls: [
                {
                    reference: _.toString(),
                    methodName: 'compute',
                    methodParameters: [
                        derivableToken,
                        5,
                        poolsSpots[poolConfigs[poolAddress].oracle] || (0, utils_1.bn)(0),
                        poolsSpots[poolConfigs[poolAddress].oracle] || (0, utils_1.bn)(0),
                    ],
                },
            ],
        });
    });
    return request;
};
exports.getMultiCallCompute = getMultiCallCompute;
//# sourceMappingURL=resource.js.map