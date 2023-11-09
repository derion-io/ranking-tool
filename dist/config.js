"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = exports.DDL_CONFIGS_URL = exports.POOL_IDS = exports.CHAIN_ID = exports.ACCEPT_ADDERSSES = exports.Z2_ADDRESS = exports.POSITION_ADDRESS = exports.PLD_ADDRESS = exports.NATIVE_ADDRESS = exports.ZERO_ADDRESS = void 0;
exports.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
exports.NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
exports.PLD_ADDRESS = '0xBa95100a0c3abaD1e10414Be77347D3D0900D8c2';
exports.POSITION_ADDRESS = '0x0819281c74bed5423c1b3283808f8e26aad18dbe';
exports.Z2_ADDRESS = '0xc3E15702653704b8afc3A1dA39314CB3FE8B8A5D';
exports.ACCEPT_ADDERSSES = ['0x8Bd6072372189A12A2889a56b6ec982fD02b0B87', '0x8Bd6072372189A12A2889a56b6ec982fD02b0B87'];
exports.CHAIN_ID = 56;
exports.POOL_IDS = {
    cToken: 131072,
    cp: 65536,
    token0: 262144,
    token1: 262145,
    native: 0x01,
    R: 0x00,
    A: 0x10,
    B: 0x20,
    C: 0x30,
};
exports.DDL_CONFIGS_URL = {
    development: 'https://raw.githubusercontent.com/derivable-labs/configs/dev/',
    production: 'https://raw.githubusercontent.com/derivable-labs/configs/main/',
};
const loadConfig = async (chainId) => {
    const env = 'development';
    const [networkConfig, uniV3Pools] = await Promise.all([
        fetch(exports.DDL_CONFIGS_URL[env] + chainId + '/network.json').then((r) => r.json()),
        fetch(exports.DDL_CONFIGS_URL[env] + chainId + '/routes.json')
            .then((r) => r.json())
            .catch(() => []),
    ]);
    return { networkConfig, uniV3Pools };
};
exports.loadConfig = loadConfig;
//# sourceMappingURL=config.js.map