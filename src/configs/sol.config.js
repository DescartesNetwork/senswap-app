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
  swapFactoryAddress: '37rupXEq1uh1SjyjVLFUMnNSqzVgtH4wPwsB1gzZ6qmK',
  cluster: 'devnet',
}

/**
 * Staging configurations
 */
configs.staging = {
  node: 'https://devnet.solana.com',
  tokenFactoryAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  swapFactoryAddress: '37rupXEq1uh1SjyjVLFUMnNSqzVgtH4wPwsB1gzZ6qmK',
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