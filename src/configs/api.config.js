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
  base: 'https://api.senswap.xyz',
}

/**
 * Production configurations
 */
configs.production = {
  base: 'https://api.senswap.com',
}

/**
 * Module exports
 */
export default configs;