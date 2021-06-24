/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  base: 'http://localhost:3000',
  baseBoard: 'https://stat.senswap.xyz/stat/reports',
}

/**
 * Staging configurations
 */
configs.staging = {
  base: 'https://api.senswap.xyz',
  baseBoard: 'https://stat.senswap.xyz/stat/reports',
}

/**
 * Production configurations
 */
configs.production = {
  base: 'https://api.senswap.com',
  baseBoard: 'https://stat.senswap.com/stat/reports',
}

/**
 * Module exports
 */
export default configs;