/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'https://devnet.solana.com',
  tokenFactoryAddress: 'JCbHuGZyQiC9abPpEHfs6W8evgumEYthpqqBsgDRewa8',
  swapFactoryAddress: '23Y2WwZY149zE7tcXrQA46Zfj3zvkkibHn3xCZ4qJBgi',
}

/**
 * Staging configurations
 */
configs.staging = {
  node: 'https://devnet.solana.com',
  tokenFactoryAddress: 'JCbHuGZyQiC9abPpEHfs6W8evgumEYthpqqBsgDRewa8',
  swapFactoryAddress: '23Y2WwZY149zE7tcXrQA46Zfj3zvkkibHn3xCZ4qJBgi',
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: '',
}

/**
 * Module exports
 */
export default configs;