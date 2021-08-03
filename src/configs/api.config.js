/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  base: 'http://localhost:3001',
  baseBoard: 'http://18.117.93.162:9090/stat',
}

/**
 * Staging configurations
 */
configs.staging = {
  base: 'https://api.senswap.xyz',
  baseBoard: 'https://stat.senswap.xyz/stat',
}

/**
 * Production configurations
 */
configs.production = {
  base: 'https://api.senswap.com',
  baseBoard: 'https://stat.senswap.com/stat',
}

/**
 * Module exports
 */
export default configs;
