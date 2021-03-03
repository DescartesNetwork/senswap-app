/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'https://devnet.solana.com',
  tokenFactoryAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  swapFactoryAddress: 'Ha2iWsVt8Y749zcYnfe6do3gzrrEWppcp5GBw4QDuimS',
  cluster: 'devnet',
}

/**
 * Staging configurations
 */
configs.staging = {
  node: 'https://devnet.solana.com',
  tokenFactoryAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  swapFactoryAddress: 'Ha2iWsVt8Y749zcYnfe6do3gzrrEWppcp5GBw4QDuimS',
  cluster: 'devnet',
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: '',
  cluster: 'mainnet',
}

/**
 * Module exports
 */
export default configs;