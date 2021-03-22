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
  swapFactoryAddress: 'Dm5Eq3fk8bCHtQazY6edRH2LbqFq2RKZbnxiTBSTZTT4',
  senAddress: '5YwUkPdXLoujGkZuo9B4LsLKj3hdkDcfP4derpspifSJ',
  cluster: 'devnet',
}

/**
 * Staging configurations
 */
configs.staging = {
  node: 'https://devnet.solana.com',
  tokenFactoryAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  swapFactoryAddress: 'Dm5Eq3fk8bCHtQazY6edRH2LbqFq2RKZbnxiTBSTZTT4',
  senAddress: '5YwUkPdXLoujGkZuo9B4LsLKj3hdkDcfP4derpspifSJ',
  cluster: 'devnet',
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: '',
  senAddress: '',
  cluster: 'mainnet',
}

/**
 * Module exports
 */
export default configs;