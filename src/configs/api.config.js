/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  base: 'http://localhost:3001',
  baseBoard: 'http://18.117.93.162:9090/stat/reports',
}

/**
 * Staging configurations
 */
configs.staging = {
  base: 'https://api.senswap.xyz',
  baseBoard: 'http://18.117.93.162:9090/stat/reports',
}

/**
 * Production configurations
 */
configs.production = {
  base: 'https://api.senswap.com',
  baseBoard: 'http://18.117.93.162:9090/stat/reports',
}

/**
 * Module exports
 */
export default configs;