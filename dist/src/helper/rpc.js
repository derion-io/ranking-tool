"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRPC = void 0;
const providers_1 = require("@ethersproject/providers");
const View_json_1 = __importDefault(require("../abi/View.json"));
const { AssistedJsonRpcProvider } = require('assisted-json-rpc-provider');
const scanApiKey = 'XGNAITEY1AI67HU25JTZTGSNCAE614F1VD';
const getRPC = (networkConfig) => {
    const { rpcGetLog, scanApi } = networkConfig;
    const rpcProvider = new providers_1.JsonRpcProvider(rpcGetLog);
    rpcProvider.setStateOverride({
        [networkConfig.derivable.logic]: {
            code: View_json_1.default.deployedBytecode,
        },
    });
    const option = typeof scanApi === 'string'
        ? {
            url: scanApi,
            maxResults: 1000,
            rangeThreshold: 0,
            rateLimitCount: 1,
            rateLimitDuration: 5000,
            apiKeys: scanApiKey ? [scanApiKey] : [],
        }
        : scanApi;
    const provider = new AssistedJsonRpcProvider(rpcProvider, option);
    return provider;
};
exports.getRPC = getRPC;
//# sourceMappingURL=rpc.js.map