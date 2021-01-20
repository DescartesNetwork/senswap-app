/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  base: 'http://localhost:3001',
}

/**
 * Staging configurations
 */
configs.staging = {
  base: 'https://testnet-api.senswap.io',
}

/**
 * Production configurations
 */
configs.production = {
  base: 'https://api.senswap.io',
}

/**
 * Module exports
 */
export default configs;