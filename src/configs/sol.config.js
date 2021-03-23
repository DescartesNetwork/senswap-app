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
  swapFactoryAddress: '66dobV8x9LMYt12XSCmFFZ9LpaomyeDXaCKVP56ujz2R',
  senAddress: '5YwUkPdXLoujGkZuo9B4LsLKj3hdkDcfP4derpspifSJ',
  cluster: 'devnet',
}

/**
 * Staging configurations
 */
configs.staging = {
  node: 'https://devnet.solana.com',
  tokenFactoryAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  swapFactoryAddress: '66dobV8x9LMYt12XSCmFFZ9LpaomyeDXaCKVP56ujz2R',
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